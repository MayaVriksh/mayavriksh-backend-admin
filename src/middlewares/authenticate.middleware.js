const { verifyToken } = require("../utils/jwt.util");
const prisma = require("../config/prisma.config");
const ERROR_MESSAGES = require("../constants/errorMessages.constant");
const {
    RESPONSE_FLAGS,
    RESPONSE_CODES
} = require("../constants/responseCodes.constant");

const authenticate = async (req, h) => {
    try {
        const token = req.state.mv_auth_token || req.headers.authorization;

        // console.log("auth token: ", req.headers.authorization);
        // console.log("cookie token: ", req.state.mv_auth_token);
        // console.log("token: ", token);

        if (!token) {
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    error: ERROR_MESSAGES.AUTH.INVALID_TOKEN
                })
                .code(RESPONSE_CODES.UNAUTHORIZED)
                .takeover();
        }

        let decoded;

        try {
            decoded = verifyToken(token);
        } catch (err) {
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    error: ERROR_MESSAGES.AUTH.INVALID_TOKEN
                })
                .code(RESPONSE_CODES.FORBIDDEN)
                .takeover();
        }

        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId },
            select: {
                userId: true,
                isActive: true,
                deletedAt: true,
                role: {
                    select: {
                        role: true
                    }
                }
            }
        });

        if (!user) {
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    error: ERROR_MESSAGES.USERS.PROFILE_NOT_FOUND
                })
                .code(RESPONSE_CODES.FORBIDDEN)
                .takeover();
        }

        if (!user.isActive || user.deletedAt) {
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    error: ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE
                })
                .code(RESPONSE_CODES.FORBIDDEN)
                .takeover();
        }

        req.auth = {
            userId: user.userId,
            role: user.role.role,
            isActive: user.isActive
        };

        return h.continue;
    } catch (err) {
        // console.error("Authentication Error:", err);
        return h
            .response({
                success: RESPONSE_FLAGS.FAILURE,
                error: ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
            })
            .code(RESPONSE_CODES.INTERNAL_SERVER_ERROR)
            .takeover();
    }
};

module.exports = { authenticate };
