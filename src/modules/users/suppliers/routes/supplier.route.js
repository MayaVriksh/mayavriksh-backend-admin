const {
    handleValidationFailure
} = require("../../../../utils/failActionValidation");
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

    // Supplier: Fetch Dashboard Summary
    {
        method: "GET",
        path: "/supplier/dashboard-summary",
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
                maxBytes: 25971520,
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

    // Supplier: Get Order Requests
    {
        method: "GET",
        path: "/supplier/order-requests",
        options: {
            tags: ["api", "Supplier Purchase Order"],
            description:
                "Get a list of active order requests for the authenticated supplier.",

            // ---: Detailed notes for frontend developers ---
            notes: `
This endpoint fetches a paginated list of **active** purchase orders for the supplier. Active orders are those that require action or are in transit (e.g., \`PENDING\`, \`AWAITING_PAYMENT\`, \`PROCESSING\`, \`SHIPPED\`).

### UI Logic & Lazy Loading
This endpoint provides the summary data needed to render the main "Purchase Order Request" table.

-   The \`status\` and \`paymentPercentage\` fields should be used to display the correct status badges and progress bars.
-   The \`_count.media\` field (which counts the number of QC images) should be used to conditionally show either an **"Upload Img for QC"** button (if count is 0) or an **"Edit QC Images"** button (if count is > 0).

This endpoint intentionally **does not** return the detailed \`PurchaseOrderItems\` or \`payments\` arrays to keep the initial page load fast. To view the details of an order, the frontend must use the order's \`id\` from this response to make a separate call to the \`GET /supplier/order-requests/{orderId}\` endpoint.
            `,

            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.SUPPLIER])],
            validate: {
                ...SupplierValidator.orderRequestValidation, // Validates query params like ?page=1
                failAction: handleValidationFailure
            },
            handler: SupplierController.listSupplierOrders,
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description:
                                "A paginated list of active purchase orders retrieved successfully."
                            // schema: SupplierValidator.listOrdersResponseSchema
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
    },

    // Supplier: Upload QC for Purchase Order
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

    // Supplier: Submit Purchase Order for Review
    {
        method: "PUT",
        path: "/supplier/purchase-orders/{orderId}/review",
        options: {
            tags: ["api", "Supplier Purchase Order"],
            description:
                "Submit an Order Items review (Accept/Reject) for a Purchase Order.",

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
                        200: {
                            description: "Order review submitted successfully."
                        },
                        400: {
                            description: "Bad Request: Invalid input data."
                        },
                        401: {
                            description:
                                "Unauthorized: Invalid or expired token."
                        },
                        403: {
                            description:
                                "Forbidden: User does not own this order."
                        },
                        404: {
                            description:
                                "Not Found: The specified order does not exist."
                        }
                    }
                }
            }
        }
    },

    // Supplier: Get Order Details by Order ID
    {
        method: "GET",
        path: "/supplier/order-requests/{orderId}",
        options: {
            tags: ["api", "Supplier Purchase Order"],
            description:
                "Get a single purchase order by its ID, including all of its items and payment history.",
            notes: `
This endpoint fetches the complete, detailed state of a single Purchase Order. The frontend UI should change its appearance and available actions based on the \`status\` fields returned in this response.

### Understanding the Response Data

The API returns the main order details, a nested \`PurchaseOrderItems\` array, and a nested \`payments\` array.

#### Interpreting the Order Status
-   **If \`status\` is \`PENDING\`:** This is a new order awaiting review.
    -   The UI should open the **interactive "Review Items" modal** where the supplier can Accept/Reject each item.
    -   The \`isAccepted\` field on all items will be \`true\` by default.
    -   The \`payments\` array will be empty.

-   **If \`status\` is \`AWAITING_PAYMENT\`, \`PARTIALLY_PAID\`, or \`PAID\`:** The order has already been reviewed and is locked.
    -   The UI should open a **read-only "View Order Items" modal**.
    -   Inside the modal, you must read the \`isAccepted\` boolean for each item to show whether it was **Accepted** or **Rejected** by the supplier during the review step.

-   **If \`status\` is \`REJECTED\` or \`CANCELLED\`:** The order is in a final, terminated state. The UI should simply display this status.

#### The \`payments\` Array
This array contains the full payment history for the order. It will be empty until the Warehouse Manager starts making payments. Use this data to populate the "View Payments" modal.
            `,
            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.SUPPLIER])],

            // This validation uses the schema from Step 1
            validate: {
                ...SupplierValidator.orderIdParamValidation,
                failAction: handleValidationFailure
            },

            handler: SupplierController.getOrderRequestByOrderId,

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

    // Supplier: Get Details of DELIVERED && COMPLETELY PAID Purchase Orders
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
                ...SupplierValidator.listHistoryValidation,
                failAction: handleValidationFailure
            },
            handler: SupplierController.getSupplierOrderHistory,

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
