const prisma = require("../../../../config/prisma.config.js");
const { v4: uuidv4 } = require("uuid");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");
/**
 * Finds a supplier's ID based on their user ID.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<object|null>} The supplier object with their ID, or null if not found.
 */
const findSupplierByUserId = async userId => {
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
    { page, search, itemsPerPage }
) => {
    const whereClause = {
        supplierId: supplierId,
        ...(search && {
            id: { contains: search, mode: "insensitive" }
        })
    };

    // Use a transaction to run both queries at the same time for efficiency.
    return await prisma.$transaction([
        prisma.purchaseOrder.count({ where: whereClause }),
        prisma.purchaseOrder.findMany({
            where: whereClause,
            skip: (page - 1) * itemsPerPage,
            take: itemsPerPage,
            orderBy: { requestedAt: "desc" },
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
                                plantSize: true,
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
                        paidAt: true,
                        remarks: true
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

const updateOrderStatus = async orderId => {
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
    const dataToCreate = mediaAssetsToCreate.map(asset => ({
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
const findOrderItemsByIds = async itemIds => {
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
    userId,
    orderId,
    itemsToUpdate,
    newTotalCost
}) => {
    // ????? Immediately fix Awaiting payment for payment status in payment isSchema, and order status should be chnaged to processing.
    const supplier = await prisma.supplier.findUnique({ where: { userId } });
    if (!supplier) throw new Error("Supplier not found.");

    return await prisma.$transaction(async tx => {
        // Security check inside the transaction
        const order = await tx.purchaseOrder.findFirst({
            where: { id: orderId, supplierId: supplier.supplierId }
        });

        if (!order) throw new Error("Order not found or access denied.");

        // Update each item's isAccepted status
         // Instead of a sequential for-loop, we create an array of all update promises.
        const updatePromises = itemsToUpdate.map(item =>
            tx.purchaseOrderItems.update({
                where: { id: item.itemId },
                data: { isAccepted: item.isAccepted }
            })
        );
        // Execute all the update promises concurrently. This is much faster.
        await Promise.all(updatePromises);
        // Update the parent order's total cost and isAccepted
        await tx.purchaseOrder.update({
            where: { id: orderId },
            data: {
                totalCost: newTotalCost,
                pendingAmount: newTotalCost,
                status: "PROCESSING",
                isAccepted: true,
                acceptedAt: new Date()
            }
        });
    });
};


module.exports = {
    findSupplierByUserId,
    findPurchaseOrdersBySupplier,
    addMediaToPurchaseOrder,
    checkPurchaseOrderExist,
    updateOrderStatus,
    findOrderItemsByIds,
    orderToReview,
    updateOrderAfterReview
};
