const { prisma } = require("../../../../config/prisma.config.js");
const { v4: uuidv4 } = require("uuid");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");
/**
 * Finds a supplier's ID based on their user ID.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<object|null>} The supplier object with their ID, or null if not found.
 */
const findSupplierByUserId = async (userId) => {
    return await prisma.supplier.findUnique({
        where: { userId: userId },
        select: { supplierId: true }
    });
};

/**
 * Fetches a paginated list of purchase orders for a given supplier.
 * @param {string} supplierId - The ID of the supplier.
 * @param {object} options - An object containing pagination and filtering options.
 * @returns {Promise<[number, object[]]>} A tuple containing the total count and the list of orders.
 */
const findPurchaseOrdersBySupplier = async (
    supplierId,
    { page, limit, orderStatus, search, sortBy, order }
) => {
    console.log("findPurchaseOrdersBySupplier: ", page, limit);

    const whereClause = {
        supplierId,
        // Exclude historical orders (DELIVERED && COMPLETELY PAID Purchase Orders)
        NOT: {
            OR: [
                { status: { in: ["REJECTED", "CANCELLED"] } },
                {
                    AND: [
                        { status: "DELIVERED" },
                        { paymentPercentage: 100 },
                        { pendingAmount: 0 }
                    ]
                }
            ]
        },
        // Add the active filter if given
        ...statusFiltersForActivePurchaseOrders[orderStatus || "ALL ORDERS"],
        ...(search && {
            id: { contains: search, mode: "insensitive" }
        })
    };

    const orderBy = {};
    if (sortBy && order) {
        orderBy[sortBy] = order;
    } else {
        // Default sort if none is provided
        orderBy["requestedAt"] = "desc";
    }
    // Use a transaction to run both queries at the same time for efficiency.
    return await prisma.$transaction([
        prisma.purchaseOrder.count({ where: whereClause }),
        prisma.purchaseOrder.findMany({
            where: whereClause,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: orderBy,
            select: {
                // This is the complete select statement from our previous discussion
                id: true,
                totalCost: true,
                pendingAmount: true,
                paymentPercentage: true,
                status: true,
                isAccepted: true,
                requestedAt: true,
                expectedDateOfArrival: true,
                supplierReviewNotes: true,
                warehouseManagerReviewNotes: true,
                // Now, fetch all related items for the details modal
                PurchaseOrderItems: {
                    select: {
                        id: true,
                        productType: true,
                        unitsRequested: true,
                        unitCostPrice: true,
                        isAccepted: true,
                        // Include Plant details if the item is a Plant
                        plant: {
                            select: { name: true }
                        },
                        plantVariant: {
                            select: {
                                size: {
                                    select: {
                                        plantSize: true
                                    }
                                },
                                sku: true,
                                /** mediaUrl:true */
                                color: {
                                    select: {
                                        name: true,
                                        hexCode: true
                                    }
                                },
                                plantVariantImages: {
                                    // This is the relation name
                                    where: { isPrimary: true }, // Filter for the primary image
                                    take: 1, // We only need one
                                    select: { mediaUrl: true } // Select just the URL
                                }
                            }
                        },
                        potVariant: {
                            select: {
                                potName: true,
                                size: true,
                                sku: true,
                                // --- ADDED: Include the nested material name for pots ---
                                material: {
                                    select: {
                                        name: true
                                    }
                                },
                                color: {
                                    select: {
                                        name: true,
                                        hexCode: true
                                    }
                                },
                                images: {
                                    // This is the relation name for pot variant images
                                    where: { isPrimary: true },
                                    take: 1,
                                    select: { mediaUrl: true }
                                }
                            }
                        }
                    }
                },
                payments: {
                    select: {
                        paymentId: true,
                        amount: true,
                        paymentMethod: true,
                        status: true,
                        receiptUrl: true,
                        publicId: true,
                        requestedAt: true,
                        paidAt: true,
                        remarks: true,
                        transactionId: true
                    }
                    // orderBy: {
                    //     // Show the payments in chronological order
                    //     requestedAt: 'asc'
                    // }
                }
            }
        })
    ]);
};

const checkPurchaseOrderExist = async (orderId, supplierId) => {
    return await prisma.purchaseOrder.findFirst({
        where: { id: orderId, supplierId: supplierId }
    });
};

const updateOrderStatus = async (orderId) => {
    return await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: {
            status: ORDER_STATUSES.SHIPPED
        }
    });
};
/**
 * Creates multiple PurchaseOrderMedia records and links them to a PurchaseOrder.
 * @param {string} purchaseOrderId - The ID of the parent order.
 * @returns {Promise<object>} The result of the Prisma createMany operation.
 */
const addMediaToPurchaseOrder = async (
    purchaseOrderId,
    mediaAssetsToCreate
) => {
    // Prepare the data for Prisma by adding the required IDs to each asset.
    const dataToCreate = mediaAssetsToCreate.map((asset) => ({
        id: uuidv4(),
        purchaseOrderId: purchaseOrderId,
        mediaUrl: asset.mediaUrl,
        publicId: asset.publicId,
        mediaType: asset.mediaType,
        resourceType: asset.resourceType,
        isPrimary: asset.isPrimary,
        uploadedBy: asset.uploadedBy
    }));

    // Use createMany for an efficient bulk-insert into the database.
    return await prisma.purchaseOrderMedia.createMany({
        data: dataToCreate
    });
};

/**
 * Fetches multiple PurchaseOrderItems by their IDs.
 * @param {string[]} itemIds - An array of PurchaseOrderItem IDs.
 * @returns {Promise<Array<object>>} A list of purchase order items with their cost and quantity.
 */
const findOrderItemsByIds = async (itemIds) => {
    return await prisma.purchaseOrderItems.findMany({
        where: {
            id: { in: itemIds }
        },
        select: {
            unitCostPrice: true,
            unitsRequested: true
        }
    });
};
const orderToReview = async ({ orderId, supplierId }) => {
    return await prisma.purchaseOrder.findFirst({
        where: {
            id: orderId,
            supplierId: supplierId
        },
        select: { id: true, status: true, totalCost: true }
    });
};

const updateOrderAfterReview = async ({
    orderId,
    rejectedItemIds,
    newTotalCost,
    tx
}) => {
    // Mark rejected items as not accepted
    await tx.purchaseOrderItems.updateMany({
        where: { id: { in: rejectedItemIds }, purchaseOrderId: orderId },
        data: { isAccepted: false }
    });

    // Mark all other items as accepted. Can be removed, as in DB they all will be marked as accepted by default
    await tx.purchaseOrderItems.updateMany({
        where: { id: { notIn: rejectedItemIds }, purchaseOrderId: orderId },
        data: { isAccepted: true }
    });

    // Update the parent order's total cost and status
    return await tx.purchaseOrder.update({
        where: { id: orderId },
        data: {
            totalCost: newTotalCost,
            pendingAmount: newTotalCost,
            status: ORDER_STATUSES.PROCESSING,
            isAccepted: true,
            acceptedAt: new Date()
        }
    });
};

/**
 * Updates an order and all its items to a REJECTED status.
 */
const rejectEntireOrder = async (orderId, tx) => {
    // Update all items to be not accepted.
    await tx.purchaseOrderItems.updateMany({
        where: { purchaseOrderId: orderId },
        data: { isAccepted: false }
    });
    // Update the parent order status.
    return await tx.purchaseOrder.update({
        where: { id: orderId },
        data: { status: "REJECTED", isAccepted: false }
    });
};

const statusFiltersForActivePurchaseOrders = {
    PENDING: { status: "PENDING" },
    PROCESSING: { status: "PROCESSING" },
    DELIVERED: { status: "DELIVERED" }, // This is "active" delivered, not yet fully paid
    ALL: {} // no extra filter → includes all active ones
};

const statusFiltersForPurchaseOrderHistory = {
    REJECTED: { status: "REJECTED" },
    DELIVERED: {
        AND: [
            { status: "DELIVERED" },
            { paymentPercentage: 100 },
            { pendingAmount: 0 }
        ]
    },
    ALL: {
        OR: [
            { status: "REJECTED" },
            {
                AND: [
                    { status: "DELIVERED" },
                    { paymentPercentage: 100 },
                    { pendingAmount: 0 }
                ]
            }
        ]
    }
};

/**
 * Fetches historical (completed or rejected) purchase orders for a given supplier.
 * @param {string} supplierId - The ID of the supplier.
 * @param {object} options - Pagination and search options.
 * @returns {Promise<[number, object[]]>} A tuple with the total count and the list of orders.
 */
const findHistoricalPurchaseOrders = async (
    supplierId,
    { page, limit, orderStatus, search, sortBy, order }
) => {
    const statusFilter =
        statusFiltersForPurchaseOrderHistory[orderStatus] ||
        statusFiltersForPurchaseOrderHistory.ALL;

    const whereClause = {
        supplierId,
        ...statusFilter,
        ...(search && {
            id: { contains: search, mode: "insensitive" }
        })
    };

    const orderBy = {};
    if (sortBy && order) {
        orderBy[sortBy] = order;
    } else {
        // Default sort if none is provided
        orderBy["requestedAt"] = "desc";
    }

    console.log("Supplier Repository --> findHistoricalPurchaseOrders --> ");
    // The data fetching transaction is identical to the active orders one.
    return await prisma.$transaction([
        prisma.purchaseOrder.count({ where: whereClause }),
        prisma.purchaseOrder.findMany({
            where: whereClause,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: orderBy,
            // We select all the same detailed information as before.
            select: {
                id: true,
                totalCost: true,
                pendingAmount: true,
                paymentPercentage: true,
                status: true,
                isAccepted: true,
                expectedDateOfArrival: true,
                requestedAt: true,
                acceptedAt: true,
                deliveredAt: true,
                supplierReviewNotes: true,
                warehouseManagerReviewNotes: true,
                supplier: {
                    select: {
                        nurseryName: true,
                        gstin: true,
                        contactPerson: {
                            // Following the relation from Supplier to User
                            select: {
                                address: true, // Assuming 'address' is a field on the User model
                                phoneNumber: true
                            }
                        }
                    }
                },
                warehouse: {
                    select: {
                        name: true, // Also fetching the warehouse name
                        officeEmail: true,
                        officeAddress: true, // Assuming 'address' is a field on the Warehouse model
                        officePhone: true
                    }
                },
                PurchaseOrderItems: {
                    where: {
                        isAccepted: true
                    },
                    select: {
                        id: true,
                        productType: true,
                        unitsRequested: true,
                        unitCostPrice: true,
                        isAccepted: true,
                        plant: { select: { name: true } },
                        plantVariant: {
                            select: {
                                size: {
                                    select: {
                                        plantSize: true
                                    }
                                },
                                sku: true,
                                /** mediaUrl:true */
                                color: {
                                    select: {
                                        name: true,
                                        hexCode: true
                                    }
                                },
                                plantVariantImages: {
                                    // This is the relation name
                                    where: { isPrimary: true }, // Filter for the primary image
                                    take: 1, // We only need one
                                    select: { mediaUrl: true } // Select just the URL
                                }
                            }
                        },
                        potCategory: { select: { name: true } },
                        potVariant: {
                            select: {
                                potName: true,
                                size: true,
                                sku: true,
                                // --- ADDED: Include the nested material name for pots ---
                                material: {
                                    select: {
                                        name: true
                                    }
                                },
                                color: {
                                    select: {
                                        name: true,
                                        hexCode: true
                                    }
                                },
                                images: {
                                    // This is the relation name for pot variant images
                                    where: { isPrimary: true },
                                    take: 1,
                                    select: { mediaUrl: true }
                                }
                            }
                        }
                    }
                },
                payments: {
                    select: {
                        paymentId: true,
                        amount: true,
                        paymentMethod: true,
                        status: true,
                        receiptUrl: true,
                        publicId: true,
                        requestedAt: true,
                        paidAt: true,
                        remarks: true,
                        transactionId: true
                    }
                    // orderBy: {
                    //     // Show the payments in chronological order
                    //     requestedAt: 'asc'
                    // }
                }
            }
        })
    ]);
};

module.exports = {
    findSupplierByUserId,
    findPurchaseOrdersBySupplier,
    addMediaToPurchaseOrder,
    checkPurchaseOrderExist,
    updateOrderStatus,
    findOrderItemsByIds,
    orderToReview,
    updateOrderAfterReview,
    rejectEntireOrder,
    findHistoricalPurchaseOrders
};
