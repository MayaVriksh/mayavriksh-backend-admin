const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant");
const SupplierController = require("../controllers/supplier.profile.controller");
const SupplierValidator = require("../validations/supplierProfile.validations");
const { verifyAccessTokenMiddleware, requireRole } = require("../../../../middlewares/authenticate.middleware");
const { ROLES } = require("../../../../constants/roles.constant"); 
module.exports = [
    // Supplier: Complete Profile
    {
        method: "GET",
        path: "/supplier/my-profile",
        options: {
            tags: ["api", "Supplier"],
            handler: SupplierController.showSupplierProfile,
            pre: [verifyAccessTokenMiddleware, requireRole(ROLES.SUPPLIER)],
            description: "Get supplier profile details"
        }
    },

    // Supplier: Complete Profile
    {
        method: "PUT",
        path: "/supplier/profile/complete",
        options: {
            tags: ["api", "Supplier"],
            description: "Complete Supplier Profile",
            notes: "Allows a newly registered supplier to complete their profile with address, GSTIN, documents, etc.",
            pre: [verifyAccessTokenMiddleware, requireRole(ROLES.SUPPLIER)],
            handler: SupplierController.completeSupplierProfile,
            validate: {
                ...SupplierValidator.completeSupplierProfile,
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
                output: "stream",
                multipart: true,
                allow: ["multipart/form-data", "application/json"]
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: {
                        200: {
                            description:
                                "Supplier profile completed successfully"
                        },
                        400: { description: "Validation error" }
                    }
                }
            }
        }
    },

    // Supplier: Update Profile
    {
        method: "PUT",
        path: "/supplier/profile/update",
        options: {
            tags: ["api", "Supplier"],
            description: "Update Supplier Profile",
            notes: "Allows a supplier to update their profile partially including media uploads",
            handler: SupplierController.updateSupplierProfile,
             pre: [verifyAccessTokenMiddleware, requireRole(ROLES.SUPPLIER)],
            validate: {
                ...SupplierValidator.updateSupplierProfile,
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
                output: "stream",
                multipart: true,
                allow: ["multipart/form-data", "application/json"]
            },
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: {
                        200: {
                            description: "Supplier profile updated successfully"
                        },
                        400: { description: "Validation error" }
                    }
                }
            }
        }
    }
];
