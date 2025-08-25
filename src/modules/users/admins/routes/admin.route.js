const {
    handleValidationFailure
} = require("../../../../utils/failActionValidation");

const AdminController = require("../controllers/admin.controller");
const AdminValidator = require("../validations/admin.validations");
const {
    verifyAccessTokenMiddleware,
    requireRole
} = require("../../../../middlewares/authenticate.middleware");
const { ROLES } = require("../../../../constants/roles.constant");

module.exports = [
    {
        method: "GET",
        path: "/admin/my-profile",
        options: {
            tags: ["api", "Admin Profile"],
            pre: [verifyAccessTokenMiddleware, requireRole(ROLES.ADMIN)],
            handler: AdminController.showAdminProfile,
            description: "Get Admin profile details"
        }
    },
    {
        method: "GET",
        // --- MODIFIED: Path changed for the admin section ---
        path: "/admin/order-requests",
        options: {
            // --- MODIFIED: Tags and description updated for Admins ---
            tags: ["api", "Admin Purchase Order"],
            description:
                "Get a list of all active purchase orders across all Admins.",

            // --- MODIFIED: Notes rewritten for an Admin's perspective ---
            notes: `
This endpoint fetches a paginated list of **active** purchase orders for administrative review. It is the primary data source for the admin's order management dashboard.

### UI Logic
-   This data is used to display the main "Purchase Orders Request" table in the admin panel.
-   The \`status\` and \`paymentPercentage\` fields are used to determine which actions are available (e.g., 'Make Payment').

### Lazy Loading
This endpoint provides the summary data for the list. To view the full details of an order, the frontend must use the order's \`id\` to make a separate call to the \`GET /admin/purchase-orders/{orderId}\` endpoint.
        `,

            // ---: Security now checks for ADMIN roles ---
            pre: [
                verifyAccessTokenMiddleware,
                requireRole([ROLES.ADMIN, ROLES.SUPER_ADMIN])
            ],

            // --- MODIFIED: Validator points to an Admin-specific validation schema ---
            validate: {
                ...AdminValidator.orderRequestValidation, // Assumes you create this
                failAction: handleValidationFailure
            },

            // --- MODIFIED: Handler now points to the AdminController ---
            handler: AdminController.listSupplierOrders,

            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description:
                                "A paginated list of active purchase orders retrieved successfully."
                            // schema: AdminValidator.listOrdersResponseSchema // Assumes you create this
                        },
                        401: {
                            description:
                                "Unauthorized: Invalid or expired token."
                        },
                        403: {
                            description: "Forbidden: User is not an admin."
                        }
                    }
                }
            }
        }
    },
    {
        method: "GET",
        path: "/admin/order-requests/{orderId}",
        options: {
            tags: ["api", "Admin Purchase Order"],
            description:
                "Get a single purchase order by its ID, including all of its items and payment history.",
            notes: `
This endpoint fetches the complete, detailed state of a single Purchase Order. The frontend UI should change its appearance and available actions based on the \`status\` fields returned in this response.

### Understanding the Response Data

The API returns the main order details, a nested \`PurchaseOrderItems\` array, and a nested \`payments\` array.

#### Interpreting the Order Status
-   **If \`status\` is \`PENDING\`:** This is a new order awaiting review.
    -   The UI should open the **interactive "Review Items" modal** where the admin can Accept/Reject each item.
    -   The \`isAccepted\` field on all items will be \`true\` by default.
    -   The \`payments\` array will be empty.

-   **If \`status\` is \`AWAITING_PAYMENT\`, \`PARTIALLY_PAID\`, or \`PAID\`:** The order has already been reviewed and is locked.
    -   The UI should open a **read-only "View Order Items" modal**.
    -   Inside the modal, you must read the \`isAccepted\` boolean for each item to show whether it was **Accepted** or **Rejected** by the admin during the review step.

-   **If \`status\` is \`REJECTED\` or \`CANCELLED\`:** The order is in a final, terminated state. The UI should simply display this status.

#### The \`payments\` Array
This array contains the full payment history for the order. It will be empty until the Warehouse Manager starts making payments. Use this data to populate the "View Payments" modal.
            `,
            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.ADMIN])],

            // This validation uses the schema from Step 1
            validate: {
                ...AdminValidator.orderIdParamValidation,
                failAction: handleValidationFailure
            },

            handler: AdminController.getOrderRequestByOrderId,

            // --- ADDED: Full Swagger Documentation ---
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description:
                                "Purchase order details retrieved successfully.",
                            // This links our response schema to the 200 status code
                            schema: AdminValidator.getOrderByIdResponseSchema
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
        method: "POST",
        path: "/admin/purchase-orders/{orderId}/payments",
        options: {
            tags: ["api", "Admin Purchase Order"],
            description:
                "Record a new payment (full or partial) for a Purchase Order.",
            pre: [
                verifyAccessTokenMiddleware,
                requireRole([
                    ROLES.ADMIN,
                    ROLES.SUPER_ADMIN,
                    ROLES.WAREHOUSE_MANAGER
                ])
            ],
            validate: {
                ...AdminValidator.recordPaymentValidation,
                failAction: handleValidationFailure
            },
            // Payload configuration for file uploads
            payload: {
                output: "stream",
                parse: true,
                multipart: true,
                allow: "multipart/form-data"
            },
            handler: AdminController.recordPayment,
            plugins: {
                "hapi-swagger": {
                    payloadType: "form",
                    responses: {
                        201: { description: "Payment recorded successfully." },
                        400: {
                            description: "Bad Request or validation error."
                        },
                        403: { description: "Forbidden." },
                        404: { description: "Purchase Order not found." }
                    }
                }
            }
        }
    },
    {
        method: "PUT",
        path: "/admin/purchase-orders/{orderId}/qc-media",
        options: {
            tags: ["api", "Admin Purchase Order"],
            description:
                "Upload Quality Check (QC) media for a purchase order.",
            notes: "Allows a admin to upload multiple images or videos for a specific order.",

            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.ADMIN])],

            validate: {
                ...AdminValidator.qcMediaUploadValidation,
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

            handler: AdminController.uploadQcMedia,

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
        path: "/admin/purchase-orders/{orderId}/restock",
        options: {
            tags: ["api", "Admin Purchase Order"],
            description:
                "Confirm delivery of a purchase order, update warehouse stock, and log any damages.",
            notes: "This is the final step in the PO lifecycle. It updates inventory based on received units, creates damage logs for any discrepancies.",
            pre: [
                verifyAccessTokenMiddleware,
                requireRole([
                    ROLES.WAREHOUSE_MANAGER,
                    ROLES.ADMIN,
                    ROLES.SUPER_ADMIN
                ])
            ],
            validate: {
                ...AdminValidator.restockOrderValidation,
                failAction: handleValidationFailure
            },
            // Payload configuration to handle file uploads (e.g., damage photos)
            payload: {
                // output: "stream",
                parse: true,
                // multipart: true,
                allow: ["application/json"]
                // maxBytes: 20 * 1024 * 1024 // 20MB limit
            },
            handler: AdminController.restockInventory,
            plugins: {
                "hapi-swagger": {
                    // payloadType: "form" // Ensures Swagger UI shows a form for multipart data
                }
            }
        }
    },
    {
        method: "GET",
        path: "/admin/order-history",
        options: {
            tags: ["api", "Admin Purchase Order"],
            description:
                "Get a list of historical (completed or rejected) order requests for the authenticated admin.",
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

            pre: [verifyAccessTokenMiddleware, requireRole([ROLES.ADMIN])],
            validate: {
                // This correctly validates query params like '?page=2'
                ...AdminValidator.listHistoryValidation,
                failAction: handleValidationFailure
            },
            handler: AdminController.getSupplierOrderHistory,

            // --- ADDED: Full Swagger Documentation ---
            plugins: {
                "hapi-swagger": {
                    responses: {
                        200: {
                            description:
                                "Order history retrieved successfully.",
                            // This links our response schema to the 200 status code
                            schema: AdminValidator.listOrdersResponseSchema
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
                            description: "Forbidden: User is not a admin."
                        }
                    }
                }
            }
        }
    }
];
