const Joi = require("joi");

const loginUserValidation = {
    payload: Joi.object({
        email: Joi.string().trim().lowercase().email().required().messages({
            "string.base": "📩 Email must be a valid string.",
            "string.empty": "📩 Email is required.",
            "string.email": "📩 Please enter a valid email address."
        }),
        password: Joi.string().trim().min(8).max(16)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/) // <-- COPIED THIS RULE
            .required().messages({
                "string.base": "🔐 Password must be a string.",
                "string.empty": "🔐 Password is required.",
                "string.min": "🔐 Password must be at least 8 characters.",
                "string.max": "🔐 Password must not exceed 16 characters.",
                "string.pattern.base": "🔐 Password must include at least one letter and one number." // <-- ADDED THIS MESSAGE
        })
    })
};
// --- ADDED: Validation for Refresh Token ---
// This validation checks the request's cookies (state) instead of the payload.
const refreshTokenValidation = {
    state: Joi.object({
        // We are ensuring that the 'mv_refresh_token' cookie exists and is a non-empty string.
        mv_refresh_token: Joi.string().required().messages({
            "string.base": "🍪 Refresh token must be a string.",
            "string.empty": "🍪 Refresh token cookie is missing. Please log in.",
            "any.required": "🍪 Refresh token cookie is required for this operation. Please log in."
        })
    }).unknown(true) // IMPORTANT: This allows other cookies to exist without causing a validation error.
};

const registerUserValidation = {
    payload: Joi.object({
        firstName: Joi.string()
            .trim()
            .min(2)
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .required()
            .messages({
                "string.base": "🌱 First name must be a valid string.",
                "string.empty": "🌱 First name is required.",
                "string.min":
                    "🌱 First name should have at least 2 characters.",
                "string.pattern.base":
                    "🌱 Only letters and spaces are allowed in the first name."
            }),
        lastName: Joi.string()
            .trim()
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .optional()
            .messages({
                "string.base": "🌿 Last name must be a valid string.",
                "string.empty": "🌿 Last name cannot be empty.",
                "string.pattern.base":
                    "🌿 Only letters and spaces are allowed in the last name."
            }),
        email: Joi.string().trim().lowercase().email().required().messages({
            "string.email": "📩 Please provide a valid email address.",
            "any.required": "📩 Email is required for your account.",
            "string.empty": "📩 Email is required."
        }),
        password: Joi.string()
            .trim()
            .min(8)
            .max(16)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
            .required()
            .messages({
                "string.min": "🔐 Password must be at least 8 characters.",
                "string.max": "🔐 Password must not exceed 16 characters.",
                "string.pattern.base":
                    "🔐 Password must include letters and numbers.",
                "any.required": "🔐 Password is required.",
                "string.empty": "🔐 Password is required."
            }),
        role: Joi.string().trim().min(3).required().messages({
            "string.base": "🌿 Role must be a valid string.",
            "string.empty": "🌿 Role is required.",
            "any.required": "🌿 Role is required."
        })
    })
};

const deactivateProfileValidation = {
    payload: Joi.object({
        deactivationReason: Joi.string()
            .trim()
            .max(255)
            .optional()
            .allow("")
            .messages({
                "string.max": "💭 Reason must be under 255 characters."
            })
    })
};

// Joi validation for the userId parameter in the URL
const reactivateUserValidation = {
    payload: Joi.object({
        userId: Joi.string().trim().required().messages({
            "string.empty": "Target User ID is required in the URL.",
            "any.required": "Target User ID parameter is required."
        })
    })
};

const changePasswordValidation = {
    payload: Joi.object({
        oldPassword: Joi.string().trim().min(8).max(16).required().messages({
            "string.empty": "🔐 Old password is required.",
            "string.min": "🔐 Old password must be at least 8 characters.",
            "string.max": "🔐 Old password must not exceed 16 characters."
        }),
        newPassword: Joi.string()
            .trim()
            .min(8)
            .max(16)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
            .required()
            .disallow(Joi.ref("oldPassword"))
            .messages({
                "string.empty": "🔐 New password is required.",
                "string.min": "🔐 New password must be at least 8 characters.",
                "string.max": "🔐 New password must not exceed 16 characters.",
                "string.pattern.base":
                    "🔐 New password must include letters and numbers.",
                "any.invalid":
                    "🔐 New password must be different from the old one 🌿"
            })
    })
};

module.exports = {
    loginUserValidation,
    refreshTokenValidation,
    registerUserValidation,
    deactivateProfileValidation,
    reactivateUserValidation,
    changePasswordValidation
};
