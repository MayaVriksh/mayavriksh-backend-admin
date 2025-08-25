const jwt = require("jsonwebtoken");

// Use separate, strong secrets for each token type from your .env file
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

/**
 * Generates a short-lived Access Token.
 * This token is sent to the client and used to access protected routes.
 * It contains user role and ID for stateless, fast verification.
 * @param {object} payload - Should contain userId, role, etc.
 * @returns {string} The access token.
 */
const generateAccessToken = (payload) => {
    return jwt.sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: "15m" }); // Short lifespan (e.g., 15 minutes)
};
/**
 * Generates a long-lived Refresh Token.
 * This token is stored in a secure HttpOnly cookie.
 * Its only purpose is to get a new access token.
 * @param {object} payload - Typically just the userId.
 * @returns {string} The refresh token.
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d" }); // Long lifespan (e.g., 7 days)
};

/**
 * Verifies an Access Token.
 * @param {string} token - The access token from the Authorization header.
 * @returns {object} The decoded payload if valid.
 */
const verifyAccessToken = (token) => {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
};
/**
 * Verifies a Refresh Token.
 * @param {string} token - The refresh token from the cookie.
 * @returns {object} The decoded payload if valid.
 */
const verifyRefreshToken = (token) => {
    const dd = jwt.verify(token, REFRESH_TOKEN_SECRET);
    console.log("xx2", dd);
    return dd;
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};
