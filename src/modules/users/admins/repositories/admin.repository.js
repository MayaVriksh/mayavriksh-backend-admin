const prisma = require("../../../../config/prisma.config.js");
const { v4: uuidv4 } = require("uuid");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");

/**
 * Finds a admin's ID based on their user ID.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<object|null>} The admin object with their ID, or null if not found.
 */
const findAdminByUserId = async userId => {
    return await prisma.admin.findUnique({
        where: { userId: userId },
        select: { adminId: true }
    });
};

/**
 * Fetches a paginated list of purchase orders for a given admin.
 * @param {string} adminId - The ID of the admin.
 * @param {object} options - An object containing pagination and filtering options.
 * @returns {Promise<[number, object[]]>} A tuple containing the total count and the list of orders.
 */
const findPurchaseOrdersByAdmin = async (
    adminId,
    { page, limit, search, sortBy, order }
) => {
    console.log(page, limit);
    const whereClause = {
        // Add a NOT clause to exclude all historical orders.
        NOT: {
            OR: [
                // Exclude orders that were rejected or cancelled.
                { status: { in: ["REJECTED", "CANCELLED"] } },
                // Exclude orders that are both DELIVERED and 100% paid.
                {
                    AND: [
                        { status: "DELIVERED" },
                        { paymentPercentage: 100 },
                        { pendingAmount: 0 }
                    ]
                }
            ]
        },
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
                        receiptUrl: true,
                        publicId: true,
                        paidAt: true,
                        remarks: true,
                        transactionId: true,
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

/**
 * Creates a payment record and updates the parent Purchase Order's financial status.
 * @param {object} params
 * @param {object} params.tx - The Prisma transaction client.
 * @param {string} params.orderId - The ID of the parent order.
 * @param {object} params.paymentData - Data for the new payment record.
 * @param {object} params.newTotals - Calculated totals { newTotalPaid, newRemainingAmount, newPaymentPercentage, newPaymentStatus }.
 */
const createPaymentAndUpdateOrder = async ({ tx, orderId, paymentData, newTotals }) => {
    // Step 1: Create the new payment record.
    await tx.purchaseOrderPayment.create({
        data: {
            paymentId: uuidv4(),
            orderId: orderId,
            ...paymentData
        }
    });

    // Step 2: Update the parent Purchase Order with the new aggregate status.
    return await tx.purchaseOrder.update({
        where: { id: orderId },
        data: {
            totalPaid: newTotals.newTotalPaid,
            remainingAmount: newTotals.newRemainingAmount,
            paymentPercentage: newTotals.newPaymentPercentage,
            paymentStatus: newTotals.newPaymentStatus,
        }
    });
};


const checkPurchaseOrderExist = async (orderId) => {
    return await prisma.purchaseOrder.findFirst({
        where: { id: orderId}
    });
};

const updateOrderStatus = async orderId => {
    return await prisma.purchaseOrder.update({
        where: { id: orderId },
        data: {
            status: ORDER_STATUSES.DELIVERED
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
    console.log(purchaseOrderId)
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

    console.log(dataToCreate)
    // Use createMany for an efficient bulk-insert into the database.
    return await prisma.purchaseOrderMedia.createMany({
        data: dataToCreate
    });
};

/**
 * Creates a log entry for a plant restock event.
 * @param {object} logData - The data for the log entry.
 * @param {object} tx - The Prisma transaction client.
 */
const createPlantRestockLog = async (logData, tx) => {
    return await tx.plantRestockEventLog.create({ data: logData });
};

/**
 * Updates the inventory for a specific plant variant in a specific warehouse.
 * Uses upsert to create a record if it doesn't exist.
 * @param {object} inventoryData - Data for the inventory update.
 * @param {object} tx - The Prisma transaction client.
 */
const updatePlantWarehouseInventory = async (inventoryData, tx) => {
    const { warehouseId, plantId, variantId, units } = inventoryData;
    return await tx.plantWarehouseInventory.upsert({
        where: { variantId }, // Assumes variantId is unique in this table
        update: {
            stockIn: { increment: units },
            currentStock: { increment: units },
            lastRestocked: new Date()
        },
        create: {
            warehouseId,
            plantId,
            variantId,
            stockIn: units,
            currentStock: units,
            lastRestocked: new Date(),
            // Set other initial values as needed
        }
    });
};

module.exports = {
    findAdminByUserId,
    findPurchaseOrdersByAdmin,
    createPaymentAndUpdateOrder,
    checkPurchaseOrderExist,
    updateOrderStatus,
    addMediaToPurchaseOrder,
    createPlantRestockLog,
    updatePlantWarehouseInventory,
};
