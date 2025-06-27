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
        const { userId } = req.auth;

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
        const { userId } = req.auth;
        const { tradeLicenseImage, nurseryImages, ...profileFields } =
            req.payload;

        // console.log("Received payload fields:", {
        //     tradeLicenseImageType: typeof tradeLicenseImage,
        //     tradeLicenseHeaders: tradeLicenseImage?.hapi?.headers,
        //     nurseryImagesType: typeof nurseryImages,
        //     nurseryImagesLength: nurseryImages?.length
        // });

        const requiredKeys = [
            "nurseryName",
            "phoneNumber",
            "streetAddress",
            "landmark",
            "city",
            "state",
            "country",
            "pinCode",
            "gstin",
            "businessCategory",
            "warehouseId"
        ];

        const missingFields = requiredKeys.filter(
            key =>
                profileFields[key] === undefined ||
                profileFields[key] === null ||
                profileFields[key] === ""
        );
        // console.log("missingFields: ", missingFields);

        const missingUploads = [];
        if (!tradeLicenseImage) missingUploads.push("tradeLicenseImage");
        if (!nurseryImages || nurseryImages.length === 0)
            missingUploads.push("nurseryImages");

        const allMissing = [...missingFields, ...missingUploads];

        if (allMissing.length > 0) {
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    message:
                        "Oops! 🌼 Some essential details seem to be missing. Let’s make sure your nursery blossoms fully — please provide nursery name, phone number, full address (street, landmark, city, state, country, pin code, latitude, longitude), GSTIN, business category, warehouse ID, a trade license image, and at least one nursery image 🌿"
                })
                .code(RESPONSE_CODES.BAD_REQUEST)
                .takeover();
        }

        // Upload trade license image
        const licenseMimeType = tradeLicenseImage?.hapi.headers["content-type"];

        const licenseUpload = await uploadBufferToCloudinary(
            tradeLicenseImage._data,
            "suppliers/trade_licenses",
            "trade_license",
            licenseMimeType
        );

        // console.log("licenseUpload", licenseUpload);

        if (!licenseUpload.success) {
            console.error("License Upload Failed:", licenseUpload.error);
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    message: ERROR_MESSAGES.CLOUDINARY.UPLOAD_FAILED
                })
                .code(RESPONSE_CODES.BAD_REQUEST)
                .takeover();
        }

        const tradeLicenseUrl = licenseUpload.data.url;
        // const tradeLicenseMediaType = getMediaType(licenseMimeType); // not needed as per the schema

        // Upload nursery images
        const nurseryUploads = await Promise.all(
            nurseryImages.map((img, i) => {
                const mimeType = img.hapi.headers["content-type"];
                return uploadBufferToCloudinary(
                    img._data,
                    "suppliers/nursery_assets",
                    `nursery_${i}`,
                    mimeType
                );
            })
        );

        // console.log("nurseryUploads", nurseryUploads);

        // Check for any failed upload
        const failedUpload = nurseryUploads.find(u => !u.success);
        if (failedUpload) {
            console.error(
                "One or more nursery uploads failed:",
                failedUpload.error
            );
            return h
                .response({
                    success: RESPONSE_FLAGS.FAILURE,
                    message: ERROR_MESSAGES.CLOUDINARY.UPLOAD_FAILED
                })
                .code(RESPONSE_CODES.BAD_REQUEST)
                .takeover();
        }

        const mediaAssets = nurseryUploads.map((upload, index) => {
            const mimeType = nurseryImages[index].hapi.headers["content-type"];
            return {
                mediaUrl: upload.data.url,
                mediaType: getMediaType(mimeType),
                isPrimary: index === 0
            };
        });

        console.log("mediaAssets", mediaAssets);

        // Pass all to service
        const result = await SupplierService.completeSupplierProfile(
            userId,
            {
                ...profileFields,
                tradeLicenseUrl
            },
            mediaAssets
        );

        // console.log("completeSupplierProfile", result);

        return h
            .response({
                success: result.success,
                message:
                    result.message || SUCCESS_MESSAGES.SUPPLIERS.PROFILE_UPDATED
            })
            .code(result.code);
    } catch (error) {
        console.error("Supplier Profile Completion Error:", error.message);
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

const updateSupplierProfile = async (req, h) => {
    try {
        const { userId } = req.auth;
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
    updateSupplierProfile
};
