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
        const payload = req.payload;

        const result = await AuthService.login(payload);
        console.log("signin: ", result);

        return h
            .response({
                success: RESPONSE_FLAGS.SUCCESS,
                message: SUCCESS_MESSAGES.AUTH.LOGIN_SUCCESS,
                data: result.userProfile
            })
            .state("mv_auth_token", result.systemToken)
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

const logout = async (_, h) => {
    try {
        return h
            .response({
                success: true,
                message: SUCCESS_MESSAGES.AUTH.LOGOUT_SUCCESS
            })
            .unstate("mv_auth_token")
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

const deactivateProfile = async (req, h) => {
    try {
        const userId = req.auth.userId;
        await AuthService.deactivateProfile(userId);

        return h
            .response({
                success: RESPONSE_FLAGS.SUCCESS,
                message: SUCCESS_MESSAGES.COMMON.PROFILE_DEACTIVATED
            })
            .code(RESPONSE_CODES.SUCCESS);
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
    deactivateProfile,
    logout,
    verifyUser,
    changePassword
};
