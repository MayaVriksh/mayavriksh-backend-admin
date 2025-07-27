const {
    handleValidationFailure
} = require("../../../../utils/failActionValidation");

const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant");
const SupplierController = require("../controllers/supplier.controller");
const SupplierValidator = require("../validations/supplierProfile.validations");
const {
    verifyAccessTokenMiddleware,
    requireRole
} = require("../../../../middlewares/authenticate.middleware");
const { ROLES } = require("../../../../constants/roles.constant");

module.exports = [
    // Supplier: Fetch Profile
    {
        method: "GET",
        path: "/supplier/my-profile",
        options: {
            tags: ["api", "Supplier Profile"],
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
            tags: ["api", "Supplier Profile"],
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
            tags: ["api", "Supplier Profile", "Warehouse"],
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
                        200: {
                            description:
                                "List of warehouses retrieved successfully."
                        },
                        401: { description: "Unauthorized." },
                        403: {
                            description: "Forbidden (user role not permitted)."
                        }
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
            tags: ["api", "Supplier Profile"],
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
            tags: ["api", "Supplier Purchase Order"],
            description:
                "Get a list of order requests for the authenticated supplier.",
            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.SUPPLIER])],
            validate: {
                ...SupplierValidator.orderRequestValidation,
                failAction: handleValidationFailure
            },
            handler: SupplierController.listOrderRequests
        }
    },
    {
        method: "PUT",
        path: "/supplier/purchase-orders/{orderId}/qc-media",
        options: {
            tags: ["api", "Supplier Purchase Order"],
            description:
                "Upload Quality Check (QC) media for a purchase order.",
            notes: "Allows a supplier to upload multiple images or videos for a specific order.",

            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.SUPPLIER])],

            validate: {
                ...SupplierValidator.orderIdParamValidation,
                failAction: handleValidationFailure
            },

            // --- Payload configuration for file uploads ---
            payload: {
                output: "stream",
                parse: true,
                multipart: true,
                allow: "multipart/form-data",
                maxBytes: 20 * 1024 * 1024 // Example: 20MB total payload size limit
            },

            handler: SupplierController.uploadQcMedia,

            plugins: {
                "hapi-swagger": {
                    // This helps document the file upload in Swagger
                    payloadType: "form"
                }
            }
        }
    },
    {
        method: "PUT",
        path: "/supplier/purchase-orders/{orderId}/review",
        options: {
            tags: ["api", "Supplier Purchase Order"],
            description: "Submit an Order Items review (Accept/Reject) for a Purchase Order.",
            
            // --- MODIFIED: Added detailed notes with examples ---
             notes: `
This endpoint handles a supplier's review of a purchase order. It supports two main scenarios:

### Case 1: Partial Rejection (Accepting some items)
Use this when the supplier can fulfill most of the order but needs to reject specific items.
-   Set \`status\` to \`"PROCESSING"\`.
-   The \`rejectedOrderItemsIdArr\` array should contain the IDs of **only the items being rejected**.

**Example Payload:**
\`\`\`json
{
  "status": "PROCESSING",
  "rejectedOrderItemsIdArr": [
    "f0c933e8-a65f-469e-ba08-bab0553f0257"
  ]
}
\`\`\`

### Case 2: Full Rejection (Rejecting the entire order)
Use this when the supplier cannot fulfill any part of the order.
-   Set \`status\` to \`"REJECTED"\`.
-   The \`rejectedOrderItemsIdArr\` array should contain the IDs of **all items** in the order.

**Example Payload:**
\`\`\`json
{
  "status": "REJECTED",
  "rejectedOrderItemsIdArr": [
    "552caf41-55fd-4944-8022-1b61a4289f50",
    "812150c6-d231-423b-94f6-945b0d4df4e0",
    "f0c933e8-a65f-469e-ba08-bab0553f0257"
  ]
}
\`\`\`
            `,
            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.SUPPLIER])],
            validate: {
                ...SupplierValidator.reviewPurchaseOrderValidation,
                failAction: handleValidationFailure
            },
            handler: SupplierController.reviewPurchaseOrder,
            plugins: {
                "hapi-swagger": {
                    payloadType: "json",
                    responses: {
                        200: { description: "Order review submitted successfully." },
                        400: { description: "Bad Request: Invalid input data." },
                        401: { description: "Unauthorized: Invalid or expired token." },
                        403: { description: "Forbidden: User does not own this order." },
                        404: { description: "Not Found: The specified order does not exist." }
                    }
                }
            }
        }
    },
    {
        method: "GET",
        path: "/supplier/order-requests/{orderId}",
        options: {
            tags: ["api", "Supplier Purchase Order"],
            description:
                "Get a single purchase order by its ID, including all of its items and payment history.",
            notes: "This endpoint is used to fetch the detailed data needed to display the 'Review Items' or 'View Details' modal for a specific order.",
            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.SUPPLIER])],

            // This validation uses the schema from Step 1
            validate: {
                ...SupplierValidator.orderIdParamValidation,
                failAction: handleValidationFailure
            },

            handler: SupplierController.getOrderRequestById,

            // --- ADDED: Full Swagger Documentation ---
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description:
                                "Purchase order details retrieved successfully.",
                            // This links our response schema to the 200 status code
                            schema: SupplierValidator.getOrderByIdResponseSchema
                        },
                        400: {
                            description: "Bad Request: The orderId is invalid."
                        },
                        401: {
                            description:
                                "Unauthorized: Invalid or expired token."
                        },
                        403: {
                            description: "Forbidden: You do not own this order."
                        },
                        404: {
                            description:
                                "Not Found: The purchase order does not exist."
                        }
                    }
                }
            }
        }
    },
    {
        method: "GET",
        path: "/supplier/order-history",
        options: {
            tags: ["api", "Supplier Purchase Order"],
            description:
                "Get a list of historical (completed or rejected) order requests for the authenticated supplier.",
             notes: `
This endpoint fetches a paginated list of orders that are in a final state. The structure of the returned order objects can vary based on whether the order was completed or rejected.

### Case 1: Completed Orders
A successfully completed order will have the following characteristics:
-   \`orderStatus\`: \`"DELIVERED"\`
-   \`paymentPercentage\`: \`100\`
-   \`isAccepted\`: \`"true"\`
-   The \`orderItems\` will show only those items whose \`isAccepted\` : will be \`"true"\` and \`payments\` arrays will be fully populated with the final details of the transaction.

### Case 2: Rejected/Cancelled Orders
A rejected or cancelled order will have these characteristics:
-   \`orderStatus\`: \`"REJECTED"\` or \`"CANCELLED"\`
-   The \`payments\` array will typically be empty as no payment was processed.
-   The \`orderItems\` array will still be present, showing all the originally requested items. The frontend can inspect the \`isAccepted: false\` status on these items if needed.
            `,

            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.SUPPLIER])],
            validate: {
                // This correctly validates query params like '?page=2'
                ...SupplierValidator.orderRequestValidation,
                failAction: handleValidationFailure
            },
            handler: SupplierController.listOrderHistory,

            // --- ADDED: Full Swagger Documentation ---
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description:
                                "Order history retrieved successfully.",
                            // This links our response schema to the 200 status code
                            schema: SupplierValidator.listOrdersResponseSchema
                        },
                        400: {
                            description:
                                "Bad Request: Invalid query parameters."
                        },
                        401: {
                            description:
                                "Unauthorized: Invalid or expired token."
                        },
                        403: {
                            description: "Forbidden: User is not a supplier."
                        }
                    }
                }
            }
        }
    }
];
