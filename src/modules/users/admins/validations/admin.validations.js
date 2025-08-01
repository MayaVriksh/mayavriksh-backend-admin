const Joi = require("joi");

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
const orderIdParamValidation = {
    params: Joi.object({
        orderId: Joi.string()
            .required()
            .description("The ID of the purchase order")
    })
};
const listHistoryValidation = {
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10), // Set a max limit for security
        search: Joi.string().allow("").optional(),
        // Whitelist the fields the user is allowed to sort by
        sortBy: Joi.string()
            .valid("requestedAt", "totalCost", "status")
            .default("requestedAt"),
        // Allow only 'asc' or 'desc' for the order
        order: Joi.string().lowercase().valid("asc", "desc").default("desc")
    })
};
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

module.exports = {
    orderRequestValidation,
    listHistoryValidation,
    orderIdParamValidation,
    getOrderByIdResponseSchema
};
