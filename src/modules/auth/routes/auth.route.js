const ERROR_MESSAGES = require("../../../constants/errorMessages.constant");
const {
    RESPONSE_FLAGS,
    RESPONSE_CODES
} = require("../../../constants/responseCodes.constant");
const {
    authenticate
} = require("../../../middlewares/authenticate.middleware");
const AuthController = require("../controllers/auth.controller");
const AuthValidator = require("../validations/auth.validator");

module.exports = [
    {
        method: "POST",
        path: "/auth/register",
        options: {
            tags: ["api", "Auth"],
            description: "Register a new user",
            notes: "Creates a new user account in the system with role-based mapping.",
            handler: AuthController.signup,
            validate: {
                ...AuthValidator.registerUserValidation,
                failAction: (_, h, err) => {
                    const customErrorMessages = err.details.map(
                        detail => detail.message
                    );
                    console.log("Validation Error: ", customErrorMessages);
                    return h
                        .response({
                            success: RESPONSE_FLAGS.FAILURE,
                            error: ERROR_MESSAGES.COMMON.BAD_REQUEST,
                            message: customErrorMessages
                        })
                        .code(RESPONSE_CODES.BAD_REQUEST)
                        .takeover();
                }
            },
            payload: {
                parse: true,
                allow: ["application/json"]
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "json",
                    responses: {
                        201: {
                            description: "User registered successfully"
                        },
                        400: {
                            description: "Validation error"
                        },
                        409: {
                            description: "User already exists"
                        }
                    }
                }
            }
        }
    },

    {
        method: "POST",
        path: "/auth/login",
        options: {
            tags: ["api", "Auth"],
            description: "Login to your account",
            notes: "Allows a user to log in using email/username and password.",
            handler: AuthController.signin,
            validate: {
                ...AuthValidator.loginUserValidation,
                failAction: (_, h, err) => {
                    const customErrorMessages = err.details.map(
                        detail => detail.message
                    );
                    console.log("Validation Error: ", customErrorMessages);
                    return h
                        .response({
                            success: RESPONSE_FLAGS.FAILURE,
                            error: ERROR_MESSAGES.COMMON.BAD_REQUEST,
                            message: customErrorMessages
                        })
                        .code(RESPONSE_CODES.BAD_REQUEST)
                        .takeover();
                }
            },
            payload: {
                parse: true,
                allow: ["application/json"]
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "json",
                    responses: {
                        200: {
                            description: "Login successful"
                        },
                        400: {
                            description: "Validation error"
                        },
                        401: {
                            description: "Unauthorized"
                        }
                    }
                }
            }
        }
    },

    {
        method: "POST",
        path: "/auth/logout",
        options: {
            tags: ["api", "Auth"],
            description: "Logout the user",
            notes: "Clears the authentication cookies and logs the user out.",
            pre: [authenticate],
            handler: AuthController.logout,
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description: "Logout successful"
                        },
                        500: {
                            description: "Logout failed due to server error"
                        }
                    }
                }
            }
        }
    },

    {
        method: "GET",
        path: "/auth/verify-profile",
        options: {
            tags: ["api", "Auth"],
            description: "Verify User Profile",
            notes: "Verifies the user's authentication status and returns profile details. Also refreshes authentication cookies if applicable.",
            pre: [authenticate],
            handler: AuthController.verifyUser,
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description: "User profile verified successfully 🌿"
                        },
                        401: {
                            description:
                                "Unauthorized - Invalid or expired token 🌱"
                        },
                        500: {
                            description:
                                "Internal Server Error while verifying profile 🌾"
                        }
                    }
                }
            }
        }
    },

    {
        method: "PUT",
        path: "/auth/deactivate-profile",
        options: {
            tags: ["api", "Auth"],
            description: "Deactivate user profile",
            notes: "Allows an authenticated user to deactivate their own profile.",
            pre: [authenticate],
            handler: AuthController.deactivateProfile,
            validate: {
                ...AuthValidator.deactivateProfileValidation,
                failAction: (_, h, err) => {
                    const customErrorMessages = err.details.map(
                        detail => detail.message
                    );
                    console.log("Validation Error: ", customErrorMessages);
                    return h
                        .response({
                            success: RESPONSE_FLAGS.FAILURE,
                            error: ERROR_MESSAGES.COMMON.BAD_REQUEST,
                            message: customErrorMessages
                        })
                        .code(RESPONSE_CODES.BAD_REQUEST)
                        .takeover();
                }
            },
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description: "Profile deactivated successfully"
                        },
                        500: {
                            description: "Internal server error"
                        }
                    }
                }
            }
        }
    },

    {
        method: "PUT",
        path: "/auth/change-password",
        options: {
            tags: ["api", "Auth"],
            description: "Change Password",
            notes: "Allows logged-in users to change their password.",
            handler: AuthController.changePassword,
            pre: [authenticate],
            validate: {
                ...AuthValidator.changePasswordValidation,
                failAction: (_, h, err) => {
                    const customErrorMessages = err.details.map(
                        detail => detail.message
                    );
                    console.log("Validation Error: ", customErrorMessages);
                    return h
                        .response({
                            success: RESPONSE_FLAGS.FAILURE,
                            error: ERROR_MESSAGES.COMMON.BAD_REQUEST,
                            message: customErrorMessages
                        })
                        .code(RESPONSE_CODES.BAD_REQUEST)
                        .takeover();
                }
            },
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description: "Password updated successfully"
                        },
                        400: {
                            description: "Validation or logical error"
                        },
                        500: {
                            description: "Server error"
                        }
                    }
                }
            }
        }
    }
];
