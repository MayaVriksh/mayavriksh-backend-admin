const { handleValidationFailure } = require("../../../../utils/failActionValidation");

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
    // Supplier: Fetch Profile
    {
        method: "GET",
        path: "/supplier/my-profile",
        options: {
            tags: ["api", "Supplier"],
            pre: [verifyAccessTokenMiddleware, requireRole(ROLES.SUPPLIER)],
            handler: SupplierController.showSupplierProfile,
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
                failAction: handleValidationFailure
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

    // --- NEW WAREHOUSE LISTING ROUTE ---
    {
        method: "GET",
        // Using a general path as warehouses can be considered a shared resource.
        path: "/warehouses", 
        options: {
            tags: ["api", "Supplier", "Warehouse"],
            description: "Get a list of all active warehouses for dropdowns.",
            notes: "Accessible by Suppliers (for profile completion) and Admins.",
            // This now uses our upgraded middleware to allow multiple roles.
            pre: [
                verifyAccessTokenMiddleware,
                requireRole([ROLES.SUPPLIER, ROLES.ADMIN, ROLES.SUPER_ADMIN]) // Just for example this roles are used. In Supplier Route folder, admin will not be used.
            ],

            // --- CONTROLLER HANDLER ---
            handler: SupplierController.listWarehouses,

            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: { description: "List of warehouses retrieved successfully." },
                        401: { description: "Unauthorized." },
                        403: { description: "Forbidden (user role not permitted)." }
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
            pre: [verifyAccessTokenMiddleware, requireRole(ROLES.SUPPLIER)],
            handler: SupplierController.updateSupplierProfile,
            validate: {
                ...SupplierValidator.updateSupplierProfile,
                failAction: handleValidationFailure
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
    },

    {
        method: "GET",
        path: "/supplier/order-requests",
        options: {
            tags: ["api", "Supplier"],
            description: "Get a list of order requests for the authenticated supplier.",
            pre: [
                verifyAccessTokenMiddleware,
                requireRole([ROLES.SUPPLIER])
            ],
            validate: {
                ...SupplierValidator.orderRequestValidation,
                failAction: handleValidationFailure
            },
            handler: SupplierController.listOrderRequests,
        }
    }
];
