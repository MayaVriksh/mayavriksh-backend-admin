const prisma = require("../../../../config/prisma.config.js");
const util = require("util");
const { v4: uuidv4 } = require("uuid");
const adminRepo = require("../repositories/admin.repository.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant");
const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant");
const SUCCESS_MESSAGES = require("../../../../constants/successMessages.constant.js");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");
const ROLES = require("../../../../constants/roles.constant.js");

const showAdminProfile = async userId => {
    const profile = await prisma.admin.findUnique({
        where: { userId },
        include: {
            contactPerson: {
                select: {
                    fullName: true,
                    email: true,
                    phoneNumber: true,
                    address: true,
                    profileImageUrl: true,
                    isActive: true,
                    deletedAt: true
                }
            }
        }
    });

    // console.log("Supplier Profile: ", profile);

    if (!profile) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.USERS.PROFILE_NOT_FOUND
        };
    }

    if (
        !profile.contactPerson?.isActive ||
        profile.contactPerson?.deletedAt !== null
    ) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE
        };
    }

    return {
        success: RESPONSE_FLAGS.SUCCESS,
        code: RESPONSE_CODES.SUCCESS,
        message: SUCCESS_MESSAGES.AUTH.PROFILE_FETCHED,
        data: profile
    };
};

const getOrderRequestById = async ({ userId, orderId }) => {
    // First, find the adminId from the userId.
    const admin = await prisma.admin.findUnique({
        where: { userId: userId },
        select: { adminId: true }
    });

    if (!admin) {
        throw {
            code: 404,
            message: "Admin profile not found for this user."
        };
    }

    // Now, find the purchase order, ensuring it matches BOTH the orderId AND the adminId.
    // This is a critical security check to prevent admins from viewing each other's orders.
    const order = await prisma.purchaseOrder.findFirst({
        where: {
            id: orderId
        },
        select: {
            // Select all the fields you need for the details page
            id: true,
            status: true,
            totalCost: true,
            pendingAmount: true,
            paymentPercentage: true,
            expectedDateOfArrival: true,
            PurchaseOrderItems: {
                select: {
                    id: true,
                    productType: true,
                    unitsRequested: true,
                    unitCostPrice: true,
                    plant: { select: { name: true } },
                    isAccepted: true
                }
            },
            payments: {
                orderBy: { paidAt: "asc" }
            }
        }
    });

    if (!order) {
        throw {
            code: 404,
            message:
                "Purchase Order not found or you do not have permission to view it."
        };
    }

    return { success: true, code: 200, data: order };
};

const listOrderRequests = async ({
    userId,
    page,
    limit,
    search,
    sortBy,
    order
}) => {
    // 1. Call the repository to get the admin ID.
    const admin = await adminRepo.findAdminByUserId(userId);

    // 2. Handle the business case where the user is not a admin.
    if (!admin) {
        return {
            success: true,
            code: 200,
            message: "Supplier profile not found for this user.",
            data: { orders: [], totalPages: 0, currentPage: page }
        };
    }

    // 3. Call the repository to get the purchase order data.
    const [totalItems, rawOrders] = await adminRepo.findPurchaseOrdersByAdmin(
        admin.adminId,
        { page, limit, search, sortBy, order }
    );
    // --- Transform the raw database results into a clean, generic structure ---
    const transformedOrders = rawOrders.map(order => {
        // --- Object 2: For the "View Payments Modal" ---
        let runningTotalPaid = 0;
        const paymentHistory = order.payments.map(payment => {
            runningTotalPaid += payment.amount;
            return {
                paidAmount: payment.amount,
                paymentStatus: order.payments.status,
                pendingAmountAfterPayment:
                    (order.totalCost || 0) - runningTotalPaid,
                paymentMethod: payment.paymentMethod,
                paymentRemarks: payment.remarks,
                receiptUrl: payment.receiptUrl,
                requestedAt: payment.requestedAt,
                paidAt: payment.paidAt
            };
        });
        // Determine the generic properties based on the productType
        // --- Object 3: For the "Order Items Modal" ---
        const orderItems = order.PurchaseOrderItems.map(item => {
            const isPlant = item.productType === "Plant";
            const productVariantName = isPlant ? item.plant?.name : "";
            const productVariantSize = isPlant
                ? item.plantVariant?.plantSize
                : item.potVariant?.size;
            const sku = isPlant ? item.plantVariant?.sku : item.potVariant?.sku;
            const productVariantColor = isPlant
                ? item.plantVariant?.color?.name
                : item.potVariant?.color?.name;
            const productVariantMaterial = isPlant
                ? null
                : item.potVariant?.material?.name;
            const productVariantImage = isPlant
                ? item.plantVariant?.plantVariantImages[0]?.mediaUrl
                : item.potVariant?.images[0]?.mediaUrl;
            const productVariantType = item.productType;
            const isAccepted = item.isAccepted;
            // Return the new, simplified item object
            return {
                id: item.id,
                productVariantImage,
                productVariantType,
                productVariantName: `${productVariantName}-${productVariantSize}-${productVariantColor}-${productVariantMaterial}`,
                sku,
                productVariantMaterial,
                requestedDate: order.requestedAt, // Date comes from the parent order
                unitCostPrice: item.unitCostPrice,
                unitRequested: item.unitsRequested,
                totalVariantCost:
                    Number(item.unitsRequested) * Number(item.unitCostPrice),
                isAccepted
            };
        });
        // Return the order with the transformed items array
        console.log(paymentHistory, orderItems);
        return {
            // All top-level fields from the PurchaseOrder
            id: order.id,
            totalOrderCost: order.totalCost,
            pendingAmount: order.pendingAmount,
            paymentPercentage: order.paymentPercentage,
            expectedDOA: order.expectedDateOfArrival,
            orderStatus: order.status,

            // The two transformed arrays
            orderItems: orderItems,
            payments: paymentHistory
        };
    });
    transformedOrders.forEach(order => {
        console.log(`\n--- Details for Order ID: ${order.id} ---`);

        // --- THIS IS THE FIX ---
        // Use util.inspect to print the entire object without truncation.
        // 'depth: null' tells it to show all nested levels.
        // 'colors: true' makes it much easier to read in the terminal.
        console.log(
            util.inspect(order, {
                showHidden: false,
                depth: null,
                colors: true
            })
        );

        console.log(`------------------------------------`);
    });
    const totalPages = Math.ceil(totalItems / limit);

    return {
        success: true,
        code: 200,
        message: "Order requests retrieved successfully.",
        data: {
            orders: transformedOrders,
            totalPages,
            totalItems,
            limit,
            skip: (page - 1) * limit,
            currentPage: parseInt(page, 10)
        }
    };
};

module.exports = {
    showAdminProfile,
    listOrderRequests,
    getOrderRequestById
};
