const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../constants/responseCodes.constant");
const { ERROR_MESSAGES } = require("../constants/errorMessages.constant");

const handleError = (h, error, context = "COMMON", errorKey = null) => {
    console.error(`${context} Error:`, error);

    const message = error?.message?.toLowerCase?.() || "";
    const contextMessages = ERROR_MESSAGES[context] || {};
    let responseMessage = ERROR_MESSAGES.COMMON.ACTION_FAILED;
    let statusCode = RESPONSE_CODES.INTERNAL_SERVER_ERROR;

    if (errorKey && contextMessages?.[errorKey]) {
        responseMessage = contextMessages[errorKey];
    } else {
        if (message.includes("not found")) {
            responseMessage =
                contextMessages.RESOURCE_NOT_FOUND ||
                contextMessages.NOT_FOUND ||
                ERROR_MESSAGES.COMMON.RESOURCE_NOT_FOUND;
            statusCode = RESPONSE_CODES.NOT_FOUND;
        } else if (
            message.includes("duplicate") ||
            message.includes("already exists")
        ) {
            responseMessage =
                contextMessages.PROFILE_ALREADY_EXISTS ||
                contextMessages.EMAIL_ALREADY_REGISTERED ||
                ERROR_MESSAGES.USERS.PROFILE_ALREADY_EXISTS;
            statusCode = RESPONSE_CODES.CONFLICT;
        } else if (message.includes("invalid credentials")) {
            responseMessage = ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS;
            statusCode = RESPONSE_CODES.UNAUTHORIZED;
        } else if (message.includes("locked")) {
            responseMessage = ERROR_MESSAGES.AUTH.ACCOUNT_LOCKED;
            statusCode = RESPONSE_CODES.LOCKED;
        } else if (message.includes("inactive")) {
            responseMessage = ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE;
            statusCode = RESPONSE_CODES.FORBIDDEN;
        } else if (message.includes("unauthorized")) {
            responseMessage =
                contextMessages.UNAUTHORIZED_ACCESS ||
                ERROR_MESSAGES.AUTH.UNAUTHORIZED_ACCESS;
            statusCode = RESPONSE_CODES.UNAUTHORIZED;
        } else if (
            message.includes("validation") ||
            message.includes("bad request")
        ) {
            responseMessage = ERROR_MESSAGES.COMMON.BAD_REQUEST;
            statusCode = RESPONSE_CODES.BAD_REQUEST;
        }
    }

    return h
        .response({
            success: RESPONSE_FLAGS.FAILURE,
            message: responseMessage
        })
        .code(statusCode);
};

module.exports = { handleError };
