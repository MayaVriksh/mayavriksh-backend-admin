const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant.js");
const SUCCESS_MESSAGES = require("../../../../constants/successMessages.constant.js.js");
const SupplierService = require("../services/supplier.service.js");
const uploadBufferToCloudinary = require("../../../../utils/mediaUpload.util.js");
const { getMediaType } = require("../../../../utils/file.utils.js");

const showSupplierProfile = async (req, h) => {
    try {
        // const { userId } = req.auth;
        // <-- MODIFIED: Get userId from `req.pre.credentials`.
        // This data comes directly from the verified JWT payload, with no extra DB call.
        const { userId } = req.pre.credentials;
        const result = await SupplierService.showSupplierProfile(userId);
        return h
            .response({
                success: result.success,
                message: result.message,
                data: result.data
            })
            .code(result.code);
    } catch (error) {
        console.error("Profile Display Error:", error);

        return h
            .response({
                success: RESPONSE_FLAGS.FAILURE,
                message: ERROR_MESSAGES.AUTH.PROFILE_DISPLAY_FAILED
            })
            .code(RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

const completeSupplierProfile = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const payload = req.payload;

        // --- MODIFIED: Simplified and Corrected Validation ---
        // 1. Define only the fields required for THIS specific form.
        // We no longer check for 'phoneNumber' here.
        const requiredTextFields = [
            'nurseryName', 'streetAddress', 'city', 'state',
            'country', 'pinCode', 'gstin', 'businessCategory', 'warehouseId'
        ];
        
        // 2. Validate that all required text fields were sent from the frontend.
        for (const field of requiredTextFields) {
            if (!payload[field]) {
                return h.response({ message: `Missing required field: ${field}` }).code(400).takeover();
            }
        }

        // 3. Validate that the required file was uploaded.
        if (!payload.tradeLicenseImage) {
            return h.response({ message: "Trade license image is required." }).code(400).takeover();
        }

        // --- MODIFIED: Streamlined File Upload Logic ---
        
        // Use a helper function for clarity to upload a single file.
        const uploadFile = async (fileStream, folder, fileName) => {
            const mimeType = fileStream.hapi.headers["content-type"];
            const result = await uploadBufferToCloudinary(fileStream._data, folder, fileName, mimeType);
            if (!result.success) {
                // Throw an error to be caught by the main try-catch block.
                throw new Error(`Failed to upload ${fileName}. Reason: ${result.error?.message}`);
            }
            return result.data.url;
        };

        // Upload the trade license.
        const tradeLicenseUrl = await uploadFile(payload.tradeLicenseImage, "suppliers/trade_licenses", `trade_license_${userId}`);

        // Upload all nursery images.
        const nurseryImages = Array.isArray(payload.nurseryImages) ? payload.nurseryImages : [payload.nurseryImages];
        const mediaAssets = await Promise.all(
            (nurseryImages || []).map(async (imageFile, index) => {
                const url = await uploadFile(imageFile, "suppliers/nursery_assets", `nursery_${userId}_${index}`);
                const mimeType = imageFile.hapi.headers["content-type"];
                return {
                    mediaUrl: url,
                    mediaType: getMediaType(mimeType),
                    isPrimary: index === 0,
                };
            })
        );
        
        // --- MODIFIED: Simplified Service Call ---
        // The service now receives a clean object of only the text fields it needs.
        const profileData = {
            nurseryName: payload.nurseryName,
            streetAddress: payload.streetAddress,
            landmark: payload.landmark || '',
            city: payload.city,
            state: payload.state,
            country: payload.country,
            pinCode: payload.pinCode,
            gstin: payload.gstin,
            businessCategory: payload.businessCategory,
            warehouseId: payload.warehouseId,
            tradeLicenseUrl: tradeLicenseUrl
        };

        const result = await SupplierService.completeSupplierProfile(userId, profileData, mediaAssets);

        return h.response(result).code(result.code);

    } catch (error) {
        console.error("Supplier Profile Completion Error:", error.message);
        return h.response({
            success: false,
            message: error.message || "An internal error occurred during profile completion."
        }).code(500);
    }
};

const listWarehouses = async (req, h) => {
    try {
        const result = await SupplierService.listAllWarehouses();
        return h.response(result).code(result.code);
    } catch (error) {
        console.error("List Warehouses Error:", error);
        return h.response({
            success: false,
            message: error.message || "Failed to retrieve warehouses."
        }).code(error.code || 500);
    }
};

const updateSupplierProfile = async (req, h) => {
    try {
        // const { userId } = req.auth;
        const { userId } = req.pre.credentials;
        const { profileImage, ...updateData } = req.payload;

        let profileImageUrl = null;

        // If profile image is uploaded
        if (profileImage && profileImage._data) {
            const profileImageMimeType =
                profileImage.hapi.headers["content-type"];

            const uploadResult = await uploadBufferToCloudinary(
                profileImage._data,
                "suppliers/profile_images",
                "supplier_profile_img",
                profileImageMimeType
            );

            if (!uploadResult.success) {
                console.error(
                    "Profile Image Upload Failed:",
                    uploadResult.error
                );
                return h
                    .response({
                        success: RESPONSE_FLAGS.FAILURE,
                        message: ERROR_MESSAGES.CLOUDINARY.UPLOAD_FAILED
                    })
                    .code(RESPONSE_CODES.BAD_REQUEST)
                    .takeover();
            }

            profileImageUrl = uploadResult.url;
        }

        // update supplier profile
        const result = await SupplierService.updateSupplierProfile(
            userId,
            updateData,
            profileImageUrl
        );

        return h
            .response({
                success: result.success,
                message: result.message
            })
            .code(result.code);
    } catch (error) {
        console.error("Update Profile Error:", error);
        if (error && error.success === RESPONSE_FLAGS.FAILURE && error.code) {
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    message: error.message
                })
                .code(error.code)
                .takeover();
        }

        return h
            .response({
                success: RESPONSE_FLAGS.FAILURE,
                message: ERROR_MESSAGES.SUPPLIERS.PROFILE_UPDATE_FAILED
            })
            .code(RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    showSupplierProfile,
    completeSupplierProfile,
    listWarehouses,
    updateSupplierProfile
};
