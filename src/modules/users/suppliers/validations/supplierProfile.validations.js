const Joi = require("joi");

const completeSupplierProfile = {
    payload: Joi.object({
        nurseryName: Joi.string().optional(),
        phoneNumber: Joi.string()
            .pattern(/^\d{10}$/)
            .optional(),
        streetAddress: Joi.string().optional(),
        landmark: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        pinCode: Joi.string().optional(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        gstin: Joi.string()
            .pattern(
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
            )
            .optional(),
        businessCategory: Joi.string().optional(),
        warehouseId: Joi.string().optional(),
        tradeLicenseImage: Joi.any()
            .meta({ swaggerType: "file" })
            .description("Trade license media file to upload")
            .optional()
            .label("trade_license_img"),
        nurseryImages: Joi.array()
            .items(
                Joi.any()
                    .meta({ swaggerType: "file" })
                    .description("Nursery media file")
                    .label("nursery_img")
            )
            .default([])
    })
};

const updateSupplierProfile = {
    payload: Joi.object({
        email: Joi.string().email().optional(),
        phoneNumber: Joi.string()
            .pattern(/^\d{10}$/)
            .optional(),
        streetAddress: Joi.string().optional(),
        landmark: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        pinCode: Joi.string().optional(),
        latitude: Joi.number().optional(),
        longitude: Joi.number().optional(),
        businessCategory: Joi.string().optional(),
        warehouseId: Joi.string().optional(),
        profileImageUrl: Joi.any()
            .meta({ swaggerType: "file" })
            .description("Profile Image file to upload")
            .optional()
            .label("profile_image_url")
    }).min(1)
};

module.exports = { completeSupplierProfile, updateSupplierProfile };
