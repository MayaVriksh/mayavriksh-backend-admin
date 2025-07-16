const AuthService = require("../services/auth.service");
const SUCCESS_MESSAGES = require("../../../constants/successMessages.constant.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../constants/responseCodes.constant.js");
const ERROR_MESSAGES = require("../../../constants/errorMessages.constant.js");

const signup = async (req, h) => {
    try {
        const data = req.payload;
        await AuthService.register(data);

        return h
            .response({
                success: RESPONSE_FLAGS.SUCCESS,
                message: SUCCESS_MESSAGES.AUTH.REGISTRATION_SUCCESS
            })
            .code(RESPONSE_CODES.CREATED);
    } catch (error) {
        console.error("Signup Error:", error);

        const isDuplicateEmail =
            error.message.includes("already exists") ||
            error.message.toLowerCase().includes("duplicate");

        const isMissingWarehouse = error.message
            .toLowerCase()
            .includes("warehouse");

        const isUnsupportedRole = error.message
            .toLowerCase()
            .includes("unsupported");

        return h
            .response({
                success: RESPONSE_FLAGS.FAILURE,
                message: isDuplicateEmail
                    ? ERROR_MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED
                    : isMissingWarehouse
                      ? "📦 Warehouse ID is required for supplier registration."
                      : isUnsupportedRole
                        ? "🚫 This role is not currently supported for signup."
                        : ERROR_MESSAGES.AUTH.REGISTRATION_FAILED
            })
            .code(
                isDuplicateEmail
                    ? RESPONSE_CODES.CONFLICT
                    : RESPONSE_CODES.BAD_REQUEST
            );
    }
};

const signin = async (req, h) => {
    try {
        const { email, password } = req.payload;
        const { userProfile, accessToken, refreshToken } = await AuthService.login(email, password);
        console.log("signin: ", userProfile, accessToken, refreshToken );
        // The secure Refresh Token is set in the HttpOnly cookie
        // The short-lived Access Token is sent in the response body for the client to use
        return h
            .response({
                success: RESPONSE_FLAGS.SUCCESS,
                message: SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS,
                data: {
                    user: userProfile,
                    accessToken: accessToken // Client will store this in memory
                }
            })
            .state("mv_refresh_token", refreshToken)
            .code(RESPONSE_CODES.SUCCESS);

    } catch (error) {
        console.error("Signin Error:", error);

        const isInvalidCreds = error.message.includes("Invalid credentials");
        const isLocked = error.message.includes("locked");
        const isInactive = error.message.includes("inactive");

        let message = ERROR_MESSAGES.AUTH.LOGIN_FAILED;
        let statusCode = RESPONSE_CODES.UNAUTHORIZED;

        if (isInvalidCreds) {
            message = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
        } else if (isLocked) {
            message = ERROR_MESSAGES.AUTH.ACCOUNT_LOCKED;
            statusCode = RESPONSE_CODES.LOCKED;
        } else if (isInactive) {
            message = ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE;
            statusCode = RESPONSE_CODES.FORBIDDEN;
        }
        return h
            .response({ success: RESPONSE_FLAGS.FAILURE, message })
            .code(statusCode);
    }
};
const refreshToken = async (req, h) => {
    try {
        const incomingRefreshToken = req.state.mv_refresh_token;
        if (!incomingRefreshToken) {
             return h.response({ error: "Refresh token not found." }).code(401);
        }
        
    console.log(incomingRefreshToken)
        // This service function will verify the refresh token and issue a new access token
        const { newAccessToken } = await AuthService.refreshUserToken(incomingRefreshToken);

        return h.response({
            success: RESPONSE_FLAGS.SUCCESS,
            accessToken: newAccessToken
        }).code(RESPONSE_CODES.SUCCESS);

    } catch (error) {
         console.error("Refresh Token Error:", error);
         // Important: clear the invalid cookie on failure
         return h.response({ error: "Invalid refresh token." }).code(403).unstate("mv_refresh_token");
    }
};

const logout = async (_, h) => {
    try {
        return h
            .response({
                success: true,
                message: SUCCESS_MESSAGES.AUTH.LOGOUT_SUCCESS
            })
            .unstate("mv_refresh_token", {
                path: "/"
            })
            // .unstate("mv_user_token", {
            //     path: "/"
            // })
            .code(RESPONSE_CODES.SUCCESS);
    } catch (error) {
        console.error("Logout error:", error);
        return h
            .response({
                success: false,
                message: ERROR_MESSAGES.AUTH.LOGOUT_FAILED
            })
            .code(RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

const verifyUser = async (req, h) => {
    try {
        const { userId } = req.auth;

        const result = await AuthService.verifyUser(userId);
        // console.log("verifyUser: ", result);

        return h
            .response({
                success: result.success,
                message: result.message,
                data: result.data
            })
            .code(result.code);
    } catch (error) {
        console.error("Logout error:", error);
        return h
            .response({
                success: error.success || RESPONSE_FLAGS.FAILURE,
                message: error.message || ERROR_MESSAGES.AUTH.LOGOUT_FAILED
            })
            .code(error.code || RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

const deactivateUser = async (req, h) => {
    try {
        // const userId = req.auth.userId;
        
        // Get the userId directly from the verified token's payload.
        const { userId } = req.pre.credentials; 
        await AuthService.deactivateUser(userId);

        return h
            .response({
                success: RESPONSE_FLAGS.SUCCESS,
                message: SUCCESS_MESSAGES.COMMON.PROFILE_DEACTIVATED
            })
            .code(RESPONSE_CODES.SUCCESS)
            .unstate("mv_refresh_token");
            
    } catch (error) {
        console.error("Deactivate Profile Error:", error);

        return h
            .response({
                success: RESPONSE_FLAGS.FAILURE,
                message: ERROR_MESSAGES.COMMON.ACTION_FAILED
            })
            .code(RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

/**
 * Controller to handle the reactivation of a user profile.
 * @param {object} req - The Hapi request object.
 * @param {object} h - The Hapi response toolkit.
 */
const reactivateUser = async (req, h) => {
    try {
        // The userId to reactivate comes from the URL parameters.
        const { userId } = req.params;
        console.log(userId)
        await AuthService.reactivateUserProfile(userId);

        return h.response({
            success: RESPONSE_FLAGS.SUCCESS,
            message: SUCCESS_MESSAGES.USERS.PROFILE_ACTIVATED
        }).code(RESPONSE_CODES.SUCCESS);

    } catch (error) {
        console.error("Admin Reactivate User Error:", error);
        return h.response({
            success: RESPONSE_FLAGS.FAILURE,
            message: error.message || ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
        }).code(RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

const changePassword = async (req, h) => {
    try {
        const { oldPassword, newPassword } = req.payload;
        const userId = req.auth.userId;

        const result = await AuthService.changePassword(
            userId,
            oldPassword,
            newPassword
        );
        // console.log("changePassword: ", result);

        return h
            .response({
                success: result.success,
                message: result.message
            })
            .code(result.code);
    } catch (error) {
        console.error("Change Password Error:", error);
        return h
            .response({
                success: error.success || RESPONSE_FLAGS.FAILURE,
                message:
                    error.message || ERROR_MESSAGES.AUTH.PASSWORD_CHANGE_FAILED
            })
            .code(error.code || RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    signup,
    signin,
    refreshToken,
    deactivateUser,
    reactivateUser,
    logout,
    verifyUser,
    changePassword
};
