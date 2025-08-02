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
const listOrderRequests = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { page, limit, search, sortBy, order } = req.query;

        // 1. Call the service. The service does all the complex work.
        const result = await AdminService.listOrderRequests({
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
        console.error("Error in listOrderRequests controller:", error.message);
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
const getOrderRequestById = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { orderId } = req.params; // Get the orderId from the URL parameter

        const result = await AdminService.getOrderRequestById({
            userId,
            orderId
        });
        return h.response(result).code(result.code);
    } catch (error) {
        console.error("Error in getOrderRequestById controller:", error);
        return h
            .response({
                success: false,
                message: error.message || "Failed to retrieve order request."
            })
            .code(error.code || 500);
    }
};

const listOrderHistory = async (req, h) => {
    try {
        const { userId } = req.pre.credentials;
        const { page = 1, limit, search, sortBy, order } = req.query;
        console.log(limit);
        const result = await SupplierService.listOrderHistory({
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
        console.error("Error in listOrderHistory controller:", error.message);

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
        console.error("Error in listOrderHistory controller:", error.message);

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

module.exports = {
    showAdminProfile,
    listOrderRequests,
    getOrderRequestById,
    listOrderHistory,
    recordPayment
};
