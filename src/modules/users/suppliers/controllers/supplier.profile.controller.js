const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant.js");
const SUCCESS_MESSAGES = require("../../../../constants/successMessages.constant.js.js");
const SupplierService = require("../services/supplier.service.js");
const uploadBufferToCloudinary = require("../../../../utils/mediaUpload.util.js");
const { getMediaType } = require("../../../../utils/file.utils.js");
const uploadMedia = require("../../../../utils/uploadMedia.js");

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
        // const { userId } = req.auth;
        const { userId } = req.pre.credentials;
        const {
            tradeLicenseImage,
            nurseryImages,
            profileImage,
            ...profileFields
        } = req.payload;

        console.log("Received payload fields:", {
            tradeLicenseImageType: typeof tradeLicenseImage,
            tradeLicenseHeaders: tradeLicenseImage?.hapi?.headers,
            profilePhotoType: typeof profileImage,
            profilePhotoHeaders: profileImage?.hapi?.headers,
            nurseryImagesType: typeof nurseryImages,
            nurseryImagesLength: nurseryImages?.length
        });
        const {
            nurseryName,
            streetAddress,
            landmark,
            city,
            state,
            country,
            pinCode,
            gstin,
            businessCategory,
            warehouseId
        } = profileFields;
        const requiredKeys = [
            "nurseryName",
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

        // Trade License Upload
        const licenseUpload = await uploadMedia({
            files: tradeLicenseImage,
            folder: "suppliers/trade_licenses",
            publicIdPrefix: "trade_license"
        });
        if (!licenseUpload.success) {
            return h
                .response({
                    success: false,
                    message: licenseUpload.message
                })
                .code(RESPONSE_CODES.BAD_REQUEST)
                .takeover();
        }

        // Nursery Images Upload
        const nurseryUpload = await uploadMedia({
            files: nurseryImages,
            folder: "suppliers/nursery_assets",
            publicIdPrefix: "nursery"
        });
        if (!nurseryUpload.success) {
            return h
                .response({
                    success: false,
                    message: nurseryUpload.message
                })
                .code(RESPONSE_CODES.BAD_REQUEST)
                .takeover();
        }

        // Profile Image Upload
        let profileUpload = null;
        if (profileImage) {
            profileUpload = await uploadMedia({
                files: profileImage,
                folder: "suppliers/profile_images",
                publicIdPrefix: "profile"
            });
            if (!profileUpload.success) {
                return h
                    .response({
                        success: false,
                        message: profileUpload.message
                    })
                    .code(RESPONSE_CODES.BAD_REQUEST)
                    .takeover();
            }
        }

        // console.log(
        //     userId,
        //     profileFields,
        //     licenseUpload.data,
        //     profileUpload?.data,
        //     nurseryUpload.data
        // );

        const result = await SupplierService.completeSupplierProfile(
            userId,
            profileFields,
            licenseUpload.data,
            profileUpload?.data,
            nurseryUpload.data
        );

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

const listWarehouses = async (req, h) => {
    try {
        const result = await SupplierService.listAllWarehouses();
        return h.response(result).code(result.code);
    } catch (error) {
        console.error("List Warehouses Error:", error);
        return h
            .response({
                success: false,
                message: error.message || "Failed to retrieve warehouses."
            })
            .code(error.code || 500);
    }
};
const listOrderRequests = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        // Get pagination and search terms from the URL query string
        const { page = 1, search = "" } = req.query;

        const result = await SupplierService.listOrderRequests({
            userId,
            page: parseInt(page, 10),
            search
        });
        return h.response(result).code(result.code);
    } catch (error) {
        // --- THIS IS THE FIX ---
        // The catch block must also explicitly return a Hapi response.
        console.error("Error in listOrderRequests controller:", error.message);

        return h
            .response({
                success: false,
                message: "An error occurred while fetching order requests.",
                error: error.message // It's helpful to include the original error message for debugging
            })
            .code(500) // Send a 500 Internal Server Error status
            .takeover(); // Tell Hapi to stop processing and send this response immediately
    }
};

module.exports = { listOrderRequests /* ... your other controller exports */ };

const updateSupplierProfile = async (req, h) => {
    try {
        // const { userId } = req.auth;
        const { userId } = req.pre.credentials;
        const { profileImage, ...updateData } = req.payload;

        // console.log("Profile image: ", typeof profileImage);
        // console.log("Profile image header: ", profileImage?.hapi?.headers);

        // Profile Image Upload
        let profileUpload = null;
        if (profileImage) {
            profileUpload = await uploadMedia({
                files: profileImage,
                folder: "suppliers/profile_images",
                publicIdPrefix: "profile"
            });
            if (!profileUpload.success) {
                return h
                    .response({
                        success: false,
                        message: profileUpload.message
                    })
                    .code(RESPONSE_CODES.BAD_REQUEST)
                    .takeover();
            }
        }

        // console.log("profileUpload: ", profileUpload);

        // update supplier profile
        const result = await SupplierService.updateSupplierProfile(
            userId,
            updateData,
            profileUpload?.data
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

const searchWarehouses = async (req, h) => {
    try {
        const { search } = req.query;

        const result = await SupplierService.searchWarehousesByName(search);
        // console.log("searchWarehouses: ", result);

        return h
            .response({
                success: result.success,
                message: result.message,
                data: result.data
            })
            .code(result.code);
    } catch (error) {
        console.error("Warehouse Search Error:", error);

        return h
            .response({
                success: error.success || RESPONSE_FLAGS.FAILURE,
                message:
                    error.message ||
                    ERROR_MESSAGES.WAREHOUSES.WAREHOUSE_NOT_FOUND
            })
            .code(error.code || RESPONSE_CODES.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    showSupplierProfile,
    completeSupplierProfile,
    listWarehouses,
    listOrderRequests,
    updateSupplierProfile
};
