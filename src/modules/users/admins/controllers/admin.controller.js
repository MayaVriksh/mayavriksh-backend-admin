const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant.js");
const SUCCESS_MESSAGES = require("../../../../constants/successMessages.constant.js.js");
const AdminService = require("../services/admin.service.js");
const uploadMedia = require("../../../../utils/uploadMedia.js");

// Profile
const showAdminProfile = async (req, h) => {
    try {
        // const { userId } = req.auth;
        // <-- MODIFIED: Get userId from `req.pre.credentials`.
        // This data comes directly from the verified JWT payload, with no extra DB call.
        const { userId } = req.pre.credentials;
        const result = await AdminService.showAdminProfile(userId);
        console.log("xxxxxxxxx", result);
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
const listSupplierOrders = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { page, limit, search, sortBy, order } = req.query;

        // 1. Call the service. The service does all the complex work.
        const result = await AdminService.listSupplierOrders({
            userId,
            page,
            limit,
            search,
            sortBy,
            order
        });
        // 2. Return the entire result object directly.
        //    The controller should not try to access 'purchaseOrderDetails' itself.
        return h.response(result).code(result.code);
    } catch (error) {
        console.error("Error in listSupplierOrders controller:", error.message);
        return h
            .response({
                success: false,
                message: "An error occurred while fetching order requests.",
                error: error.message
            })
            .code(500)
            .takeover();
    }
};
const getOrderRequestByOrderId = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { orderId } = req.params; // Get the orderId from the URL parameter

        const result = await AdminService.getOrderRequestByOrderId({
            userId,
            orderId
        });
        return h.response(result).code(result.code);
    } catch (error) {
        console.error("Error in getOrderRequestByOrderId controller:", error);
        return h
            .response({
                success: false,
                message: error.message || "Failed to retrieve order request."
            })
            .code(error.code || 500);
    }
};

const getSupplierOrderHistory = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { page = 1, limit, search, sortBy, order } = req.query;
        console.log(limit);
        const result = await AdminService.getSupplierOrderHistory({
            userId,
            page,
            limit,
            search,
            sortBy,
            order,
            search
        });

        return h.response(result).code(result.code);
    } catch (error) {
        // Log the full error for server-side debugging
        console.error("Error in getSupplierOrderHistory controller:", error.message);

        // Return a standardized JSON error response to the client
        return h
            .response({
                success: false,
                message:
                    error.message ||
                    "An error occurred while fetching order history."
            })
            .code(error.code || 500) // Use the error's specific code or default to 500
            .takeover(); // Tell Hapi to stop and send this response immediately
    }
};

const recordPayment = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { orderId } = req.params;
        // Destructure the payload to separate the file from the text fields
        const { receipt, ...paymentDetails } = req.payload;

        const result = await AdminService.recordPaymentForOrder({
            orderId,
            paidByUserId: userId,
            paymentDetails,
            receiptFile: receipt
        });
        return h.response(result).code(result.code);
    } catch (error) {
        // Log the full error for server-side debugging
        console.error("Error in getSupplierOrderHistory controller:", error.message);

        // Return a standardized JSON error response to the client
        return h
            .response({
                success: false,
                message:
                    error.message ||
                    "An error occurred while fetching order history."
            })
            .code(error.code || 500) // Use the error's specific code or default to 500
            .takeover(); // Tell Hapi to stop and send this response immediately
    }
};

const uploadQcMedia = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { orderId } = req.params;
        const { qcMedia } = req.payload;

        // The key 'qcMedia' should match the name attribute of your file input on the frontend.
        // const files = payload.qcMedia;

        if (!qcMedia) {
            return h
                .response({
                    message:
                        "No files uploaded. Please use the 'qcMedia' field."
                })
                .code(400);
        }
        const uploadResult = await uploadMedia({
            files: qcMedia,
            folder: `admin/QC_Images/QC_${orderId}`,
            publicIdPrefix: `qc_${Date.now()}`
        });
        if (!uploadResult.success) {
            return h
                .response({ success: false, message: uploadResult.message })
                .code(400)
                .takeover();
        }
        console.log("xx", uploadResult);
        // 2. Controller calls the simplified service with the upload results.
        const result = await AdminService.uploadQcMediaForOrder({
            userId,
            orderId,
            uploadedMedia: uploadResult.data
        });

        return h.response(result).code(result.code);
    } catch (error) {
        console.error("QC Media Upload Controller Error:", error);
        return h
            .response({
                success: false,
                message: error.message || "Failed to upload QC media."
            })
            .code(error.code || 500);
    }
};
const restockInventory = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { role } = req.pre.credentials;
        const { orderId } = req.params;
        const payload = req.payload;
        const result = await AdminService.restockInventory({
            orderId,
            handledById: userId,
            handledBy: role,
            payload: payload
        });
        return h.response(result).code(result.code);
    } catch (error) {
        console.error(
            "Error in restockPurchaseOrder controller:",
            error.message
        );

        // Return a standardized JSON error response to the client
        return h
            .response({
                success: false,
                message:
                    error.message ||
                    "An error occurred while Refilling Inentory stocks."
            })
            .code(error.code || 500) // Use the error's specific code or default to 500
            .takeover(); // Tell Hapi to stop and send this response immediately
    }
};

module.exports = {
    showAdminProfile,
    listSupplierOrders,
    getOrderRequestByOrderId,
    getSupplierOrderHistory,
    recordPayment,
    uploadQcMedia,
    restockInventory
};
