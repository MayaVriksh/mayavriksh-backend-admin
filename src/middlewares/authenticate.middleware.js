const {
    issueNewAccessToken
} = require("../modules/auth/controllers/auth.controller");
const { verifyAccessToken } = require("../utils/jwt.util");

/**
 * Hapi middleware to verify a JWT Access Token from the Authorization header.
 * This is stateless and DOES NOT query the database, making it extremely fast.
 * It attaches the decoded user payload to req.pre.credentials for use in subsequent handlers.
 */
// --- Bouncer #1: The Wristband Checker ---
const verifyAccessTokenMiddleware = {
    // This is Hapi-specific. It means "whatever this function returns,
    // store it in the request object at 'req.pre.credentials' for later use".
    assign: "credentials",

    method: async (req, h) => {
        try {
            // 1. Get the "Authorization" header from the incoming request.

            // const authHeader = req.headers.authorization;
            const authHeader = req.state.mv_access_token;

            console.log(
                "Received token (in middleware): ",
                authHeader,
                "\n\nrefresh\n\n",
                req.state.mv_refresh_token
            );

            // 2. Check if the header exists and is correctly formatted. It must start with "Bearer ".
            if (!authHeader) {
                if (req.state.mv_refresh_token) issueNewAccessToken(req, h);
                else throw new Error("Token is missing or malformed.");
            }

            // 4. THE MOST IMPORTANT STEP: Verify the token's signature.
            // The `verifyAccessToken` function uses the ACCESS_TOKEN_SECRET to check the "hologram".
            // If the token is expired, fake, or tampered with, this line will FAIL and throw an error.
            // --- THIS IS THE NEW, BULLETPROOF LOGIC ---
            let token;
            // Check if the header is in the standard "Bearer <token>" format.
            if (authHeader.startsWith("Bearer ")) {
                // If yes, extract just the token part.
                token = authHeader.split(" ")[1];
            } else {
                // If no, assume the client sent the raw token directly. This makes our backend more robust.
                token = authHeader;
            }
            // --- END OF NEW LOGIC ---

            if (!token) {
                throw new Error("Token is missing after parsing header.");
            }
            console.log("yoooooo");
            // Now, we are guaranteed to be verifying only the token string.
            const decoded = verifyAccessToken(token);
            console.log("Decoded token (in auth middleware): ", decoded);
            // 5. SUCCESS! The token is valid. We return the decoded payload.
            // Because of `assign: 'credentials'`, this object (`{ userId, role, username }`)
            // is now available at `req.pre.credentials`.
            return decoded;
        } catch (err) {
            // This 'catch' block runs if step 4 fails for any reason.
            // We immediately stop the request and send a 401 Unauthorized error.
            // .takeover() tells Hapi to not process anything further.

            console.log("Auth middleware error: ", err);

            return h
                .response({
                    error: "Unauthorized: Session has expired or token is invalid."
                })
                .code(401)
                .takeover();
        }
    }
};

/**
 * Hapi middleware to check if the verified user has a specific role.
 * Depends on verifyAccessTokenMiddleware running first.
 * @param {string} allowedRoles[] - The role to check for (e.g., 'admin').
 */
// --- Bouncer #2: The VIP Section Guard ---
// This is a "factory" that creates a middleware. You call it like `requireRole('admin')`.
const requireRole = (allowedRoles) => ({
    // We don't strictly need to assign its result, but it's good practice.
    assign: "roleCheck",

    method: (req, h) => {
        console.log(1);
        // 1. This middleware RUNS AFTER `verifyAccessTokenMiddleware`.
        const userCredentials = req.pre.credentials;
        // This will now work because verifyAccessTokenMiddleware will correctly set credentials.
        if (!userCredentials || !userCredentials.role) {
            return h
                .response({
                    error: "Authentication credentials not found. Middleware order might be incorrect."
                })
                .code(500)
                .takeover();
        }
        // So, we can safely access `req.pre.credentials` because we know it exists.
        const { role } = userCredentials;
        // 2. We simply check if the role from the token matches the role this route require
        // The check now uses .includes() on the array of allowed roles for the specific route from here this "pre" is called. Here /warehouse.
        if (allowedRoles.includes(role)) {
            return h.continue; // Success! The user's role is in the list.
        }

        // 3. The roles do not match. Deny access.
        // We use 403 Forbidden, which means "I know who you are, but you are not allowed here."
        return h
            .response({
                error: "Access Denied: You do not have permission to access this resource."
            })
            .code(403)
            .takeover();
    }
});

module.exports = { verifyAccessTokenMiddleware, requireRole };
