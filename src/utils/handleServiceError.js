const handleServiceError = (error, h, fallbackMessage) => {
    if (error && error.success === RESPONSE_FLAGS.FAILURE && error.code) {
        return h
            .response({
                success: RESPONSE_FLAGS.FAILURE,
                message: error.message
            })
            .code(error.code)
            .takeover();
    }

    console.error("Unexpected Error:", error);
    return h
        .response({
            success: RESPONSE_FLAGS.FAILURE,
            message: fallbackMessage
        })
        .code(RESPONSE_CODES.INTERNAL_SERVER_ERROR);
};

module.exports = handleServiceError;
