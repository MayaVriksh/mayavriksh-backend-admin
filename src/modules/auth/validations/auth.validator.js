const Joi = require("joi");

const loginUserValidation = {
    payload: Joi.object({
        email: Joi.string().trim().lowercase().email().messages({
            "string.base": "📩 Email must be a valid string.",
            "string.empty":
                "📩 Email is required if phone number is not provided.",
            "string.email": "📩 Please enter a valid email address."
        }),
        phoneNumber: Joi.string()
            .trim()
            .pattern(/^[6-9]\d{9}$/)
            .messages({
                "string.base": "📞 Phone number must be a valid string.",
                "string.empty":
                    "📞 Phone number is required if email is not provided.",
                "string.pattern.base":
                    "📞 Phone number must be a valid 10-digit Indian number."
            }),
        password: Joi.string().trim().min(8).max(16).required().messages({
            "string.base": "🔐 Password must be a string.",
            "string.empty": "🔐 Password is required.",
            "string.min": "🔐 Password must be at least 8 characters.",
            "string.max": "🔐 Password must not exceed 16 characters.",
            "any.required": "🔐 Password is required to log in."
        })
    })
        .xor("email", "phoneNumber")
        .messages({
            "object.missing":
                "🌿 Please provide either email or phone number to log in."
        })
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
                "string.base":
                    "🌱 First name must be a string made of letters.",
                "string.empty": "🌱 First name cannot be empty — let it bloom!",
                "string.min":
                    "🌱 First name should have at least 2 characters.",
                "string.max": "🌱 First name should not exceed 50 characters.",
                "string.pattern.base":
                    "🌱 Only letters and spaces are allowed in the first name.",
                "any.required":
                    "🌱 First name is required to grow your account."
            }),

        lastName: Joi.string()
            .trim()
            .max(50)
            .pattern(/^[a-zA-Z\s]+$/)
            .optional()
            .messages({
                "string.base": "🌿 Last name must be a string made of letters.",
                "string.empty": "🌿 Last name cannot be just a space.",
                "string.max": "🌿 Last name should not exceed 50 characters.",
                "string.pattern.base":
                    "🌿 Only letters and spaces are allowed in the last name."
            }),

        email: Joi.string().trim().lowercase().email().required().messages({
            "string.base": "📩 Email must be a valid string.",
            "string.email": "📩 Please provide a valid email address.",
            "string.empty": "📩 Email is required to plant your account.",
            "any.required": "📩 Email is required to grow your profile."
        }),

        phoneNumber: Joi.string()
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
                "string.base": "📞 Phone number must be a string of digits.",
                "string.empty":
                    "📞 Phone number is required for us to stay connected.",
                "string.pattern.base":
                    "📞 Phone number must be a valid 10-digit Indian number.",
                "any.required": "📞 Phone number is required."
            }),

        password: Joi.string()
            .trim()
            .min(8)
            .max(16)
            .pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/)
            .required()
            .messages({
                "string.base": "🔐 Password must be a secure string.",
                "string.empty":
                    "🔐 Password is required to protect your garden.",
                "string.min": "🔐 Password must be at least 8 characters.",
                "string.max": "🔐 Password must not exceed 16 characters.",
                "string.pattern.base":
                    "🔐 Password must include both letters and numbers.",
                "any.required": "🔐 Password is required."
            }),

        role: Joi.string().trim().min(3).required().messages({
            "string.base": "🌿 Role must be a valid string.",
            "string.empty":
                "🌿 Role is required — every plant needs a purpose.",
            "string.min": "🌿 Role must be at least 3 characters long.",
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
    registerUserValidation,
    deactivateProfileValidation,
    changePasswordValidation
};
