const Joi = require("joi");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant");

const completeSupplierProfile = {
    payload: Joi.object({
        nurseryName: Joi.string().required().messages({
            "string.base": "🌱 Nursery name must be a valid string.",
            "string.empty":
                "🌱 Nursery name is required to root your identity.",
            "any.required": "🌱 Nursery name is required."
        }),
        streetAddress: Joi.string().required().messages({
            "string.base": "🏡 Street address must be a valid string.",
            "string.empty": "🏡 Street address cannot be empty.",
            "any.required": "🏡 Street address is required."
        }),
        landmark: Joi.string().required().messages({
            "string.base": "📍 Landmark must be a valid string.",
            "string.empty": "📍 Please mention a landmark near your nursery.",
            "any.required": "📍 Landmark is required."
        }),
        city: Joi.string().required().messages({
            "string.base": "🏙️ City must be a valid string.",
            "string.empty": "🏙️ City cannot be left blank.",
            "any.required": "🏙️ City is required."
        }),
        state: Joi.string().required().messages({
            "string.base": "🗺️ State must be a valid string.",
            "string.empty": "🗺️ Please provide the state.",
            "any.required": "🗺️ State is required."
        }),
        country: Joi.string().required().messages({
            "string.base": "🌍 Country must be a valid string.",
            "string.empty": "🌍 Country cannot be empty.",
            "any.required": "🌍 Country is required."
        }),
        pinCode: Joi.string().required().messages({
            "string.base": "📮 Pincode must be a valid string.",
            "string.empty": "📮 Pincode is required.",
            "any.required": "📮 Pincode is required for precise location."
        }),
        // latitude: Joi.number().required().messages({
        //     "number.base": "🧭 Latitude must be a number.",
        //     "any.required":
        //         "🧭 Latitude is required to place your nursery on the map."
        // }),
        // longitude: Joi.number().required().messages({
        //     "number.base": "🧭 Longitude must be a number.",
        //     "any.required": "🧭 Longitude is required to locate your nursery."
        // }),
        gstin: Joi.string()
            .pattern(
                /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
            )
            .required()
            .messages({
                "string.base": "💼 GSTIN must be a valid string.",
                "string.empty": "💼 GSTIN is required.",
                "string.pattern.base":
                    "💼 Please provide a valid GSTIN number.",
                "any.required": "💼 GSTIN is required for verification."
            }),
        businessCategory: Joi.string().required().messages({
            "string.base": "🏷️ Business category must be a string.",
            "string.empty": "🏷️ Business category cannot be empty.",
            "any.required": "🏷️ Business category is required."
        }),
        warehouseId: Joi.string().required().messages({
            "string.base": "🏬 Warehouse ID must be a valid string.",
            "string.empty": "🏬 Please provide the warehouse ID.",
            "any.required": "🏬 Warehouse ID is required."
        }),
        profileImage: Joi.any()
            .meta({ swaggerType: "file" })
            .description("Profile image file to upload")
            .label("profile_image")
            .messages({
                "any.base": "🌿 Please upload a valid profile image file."
            }),
        tradeLicenseImage: Joi.any()
            .meta({ swaggerType: "file" })
            .description("Trade license media file to upload")
            .required()
            .label("trade_license_img")
            .messages({
                "any.required":
                    "📜 Trade license image is required for registration."
            }),
        nurseryImages: Joi.array()
            .items(
                Joi.any()
                    .meta({ swaggerType: "file" })
                    .description("Nursery media file")
                    .label("nursery_img")
            )
            .min(1)
            .required()
            .messages({
                "array.base": "🖼️ Nursery images must be in an array.",
                "array.min":
                    "🖼️ Please upload at least two images of your nursery.",
                "any.required": "🖼️ Nursery images are required."
            })
    })
};
const updateSupplierProfile = {
    payload: Joi.object({
        email: Joi.string().email().optional().messages({
            "string.email": "📩 Please provide a valid email address."
        }),
        phoneNumber: Joi.string()
            .pattern(/^[6-9]\d{9}$/)
            .optional()
            .messages({
                "string.pattern.base":
                    "📞 Phone number must be a valid 10-digit Indian number."
            }),
        streetAddress: Joi.string().optional(),
        landmark: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        pinCode: Joi.string().optional(),
        latitude: Joi.number().optional().messages({
            "number.base": "🧭 Latitude must be a valid number."
        }),
        longitude: Joi.number().optional().messages({
            "number.base": "🧭 Longitude must be a valid number."
        }),
        businessCategory: Joi.string().optional(),
        warehouseId: Joi.string().optional(),
        profileImage: Joi.any()
            .meta({ swaggerType: "file" })
            .description("Profile Image file to upload")
            .optional()
            .label("profile_image")
    }).min(1)
};

// A single, powerful validation schema for the order list endpoint
const orderRequestValidation = {
    query: Joi.object({
        // For pagination
        page: Joi.number()
            .integer()
            .min(1)
            .default(1)
            .description("The page number to retrieve"),
        limit: Joi.number()
            .integer()
            .min(1)
            .max(100)
            .default(10)
            .description("The number of items to return per page (max 100)"),
        orderStatus: Joi.string()
            .valid(
                ORDER_STATUSES.PENDING,
                ORDER_STATUSES.PROCESSING,
                ORDER_STATUSES.DELIVERED,
                "ALL ORDERS"
            )
            .default("ALL ORDERS")
            .description("Order status"),

        // For searching
        search: Joi.string()
            .allow("")
            .optional()
            .description("A search term to filter orders by ID"),

        // For sorting
        sortBy: Joi.string()
            .valid("requestedAt", "totalCost", "status")
            .default("requestedAt")
            .description("The field to sort by"),
        order: Joi.string()
            .lowercase()
            .valid("asc", "desc")
            .default("desc")
            .description('The sort order ("asc" or "desc")')
    })
};

const listHistoryValidation = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10), // Set a max limit for security
        search: Joi.string().allow("").optional(),
        orderStatus: Joi.string()
            .valid(ORDER_STATUSES.DELIVERED, ORDER_STATUSES.REJECTED, "ALL ORDERS")
            .default("ALL ORDERS")
            .description("Order status"),
        // Whitelist the fields the user is allowed to sort by
        sortBy: Joi.string()
            .valid("requestedAt", "totalCost", "status")
            .default("requestedAt"),
        // Allow only 'asc' or 'desc' for the order
        order: Joi.string().lowercase().valid("asc", "desc").default("desc")
    })
};
const reviewPurchaseOrderValidation = {
    params: Joi.object({
        orderId: Joi.string()
            .required()
            .description("The ID of the Purchase Order being reviewed.")
    }),
    payload: Joi.object({
        status: Joi.string()
            .valid("PROCESSING", "REJECTED")
            .required()
            .description(
                "Set to 'PROCESSING' for partial acceptance, or 'REJECTED' for full rejection."
            ),
        rejectedOrderItemsIdArr: Joi.array()
            .items(Joi.string())
            .required() // The array key itself must be present
            .description(
                "An array of PurchaseOrderItem IDs being rejected. Send an empty array [] if all items are accepted."
            )
    })
};
const orderIdParamValidation = {
    params: Joi.object({
        orderId: Joi.string()
            .required()
            .description("The ID of the purchase order")
    })
};

// --- NEW: A detailed schema for the successful 200 OK response ---

// --- 1. A reusable schema for a single transformed order item ---
const orderItemSchema = Joi.object({
    id: Joi.string().required(),
    productType: Joi.string().valid("Plant", "Pot").required(),
    variantImage: Joi.string().uri().allow(null, ""),
    variantName: Joi.string().required(),
    sku: Joi.string().allow(null, ""),
    material: Joi.string().allow(null, ""),
    requestedDate: Joi.date().required(),
    unitCostPrice: Joi.number().required(),
    unitRequested: Joi.number().integer().required(),
    totalVariantCost: Joi.number().required(),
    isAccepted: Joi.boolean() // This may or may not be in the transformed object, so keep it flexible
}).label("TransformedOrderItem");

// --- 2. A reusable schema for a single payment history item ---
const paymentItemSchema = Joi.object({
    paidAmount: Joi.number().required(),
    pendingAmountAfterPayment: Joi.number().required(),
    paymentMethod: Joi.string().required(),
    paymentRemarks: Joi.string().allow(null, ""),
    receiptUrl: Joi.string().uri().allow(null, ""),
    requestedAt: Joi.date(),
    paidAt: Joi.date().allow(null)
}).label("PaymentHistoryItem");

// --- 3. The main schema for the entire API response ---
// This combines the pieces above to validate the full structure.
const getOrderByIdResponseSchema = Joi.object({
    success: Joi.boolean().example(true).required(),
    code: Joi.number().example(200).required(),
    data: Joi.object({
        // Top-level PurchaseOrder fields
        id: Joi.string().required(),
        status: Joi.string().required(),
        totalCost: Joi.number().allow(null),
        pendingAmount: Joi.number().allow(null),
        paymentPercentage: Joi.number().integer().required(),
        expectedDateOfArrival: Joi.date().required(),
        requestedAt: Joi.date().required(),
        isAccepted: Joi.boolean().required(),

        // The nested array of transformed items
        PurchaseOrderItems: Joi.array().items(orderItemSchema).required(),

        // The nested array of transformed payments
        payments: Joi.array().items(paymentItemSchema).required()
    })
}).label("GetOrderByIdSuccessResponse");

// A schema for a single order SUMMARY in the list
const orderSummarySchema = Joi.object({
    id: Joi.string().required(),
    totalCost: Joi.number().allow(null),
    pendingAmount: Joi.number().allow(null),
    paymentPercentage: Joi.number().integer().required(),
    status: Joi.string().required(),
    expectedDateOfArrival: Joi.date().required(),
    _count: Joi.object({
        media: Joi.number().integer().required()
    })
}).label("OrderSummary");

// The schema for the entire successful response payload
const listOrdersResponseSchema = Joi.object({
    success: Joi.boolean().example(true),
    code: Joi.number().example(200),
    message: Joi.string(),
    data: Joi.object({
        orders: Joi.array().items(orderSummarySchema),
        totalPages: Joi.number().integer().example(10),
        currentPage: Joi.number().integer().example(1)
    })
}).label("ListOrdersResponse");

module.exports = {
    completeSupplierProfile,
    updateSupplierProfile,
    orderRequestValidation,
    reviewPurchaseOrderValidation,
    orderIdParamValidation,
    listOrdersResponseSchema,
    listHistoryValidation,
    getOrderByIdResponseSchema
};
