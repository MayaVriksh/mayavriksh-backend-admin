const prisma = require("../../../../config/prisma.config.js");
const { v4: uuidv4 } = require("uuid");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");

/**
 * Finds a admin's ID based on their user ID.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<object|null>} The admin object with their ID, or null if not found.
 */
const findAdminByUserId = async (userId) => {
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
const findPurchaseOrdersByAdmin = async ({
    page,
    limit,
    search,
    sortBy,
    order
}) => {
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

/**
 * Creates a payment record and updates the parent Purchase Order's financial status.
 * @param {object} params
 * @param {object} params.tx - The Prisma transaction client.
 * @param {string} params.orderId - The ID of the parent order.
 * @param {object} params.paymentData - Data for the new payment record.
 * @param {object} params.newTotals - Calculated totals { newTotalPaid, newRemainingAmount, newPaymentPercentage, newPaymentStatus }.
 */
const createPaymentAndUpdateOrder = async ({
    tx,
    orderId,
    paymentData,
    newTotals
}) => {
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
            paymentStatus: newTotals.newPaymentStatus
        }
    });
};

const checkPurchaseOrderExist = async (orderId) => {
    return await prisma.purchaseOrder.findFirst({
        where: { id: orderId }
    });
};

const updateOrderStatus = async (orderId) => {
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
    console.log(purchaseOrderId);
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

    console.log(dataToCreate);
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
 * Fetches historical (completed or rejected) purchase orders for a given admin.
 * @param {string} adminId - The ID of the admin.
 * @param {object} options - Pagination and search options.
 * @returns {Promise<[number, object[]]>} A tuple with the total count and the list of orders.
 */
const findHistoricalPurchaseOrders = async ({
    page,
    limit,
    search,
    sortBy,
    order
}) => {
    const whereClause = {
        OR: [
            { status: { in: ["REJECTED"] } },
            {
                AND: [
                    { status: "DELIVERED" },
                    { paymentPercentage: 100 },
                    { pendingAmount: 0 }
                ]
            }
        ],
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

    console.log("vvsdfasd");
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

// Universal function to create a damage log
const createDamageLog = async (productType, data, tx) => {
    const model = productType === "PLANT" ? tx.plantDamagedProduct : tx.potDamagedProduct;

    // --- THIS IS THE FIX ---
    // We must wrap the foreign keys in 'connect' objects to establish the relationships.
    const createData = {
        damageId: data.damageId,
        unitsDamaged: data.unitsDamaged,
        unitsDamagedPrice: data.unitsDamagedPrice,
        totalAmount: data.totalAmount,
        reason: data.reason,
        notes: data.notes,
        handledById: data.handledById,
        handledBy: data.handledBy,
        damageType: data.damageType,
        mediaUrl: data.mediaUrl,
        publicId: data.publicId,

        // Prisma needs these 'connect' blocks to link the records
        plants: {
            connect: { plantId: data.plantId }
        },
        plantVariant: {
            connect: { variantId: data.plantVariantId }
        },
        warehouse: {
            connect: { warehouseId: data.warehouseId }
        },
        purchaseOrder: {
            connect: { id: data.purchaseOrderId }
        },
        purchaseOrderItem: {
            connect: { id: data.purchaseOrderItemId }
        }
    };

    return await model.create({
        data: createData
    });
};

// Universal function to create a restock log
const createRestockLog = async (productType, data, tx) => {
    const model =
        productType === "PLANT"
            ? tx.plantRestockEventLog
            : tx.potRestockEventLog;
    return await model.create({ data });
};

// Universal function to update warehouse inventory
const updateWarehouseInventory = async (productType, data, tx) => {
    const { warehouseId, variantId, unitsReceived, unitsDamaged, unitCostPrice } = data;
    const model =
        productType === "PLANT"
            ? tx.plantWarehouseInventory
            : tx.potWarehouseInventory;

     const existingInventory = await model.findUnique({
        where: {
            // Prisma's syntax for a composite unique key @@unique([warehouseId, variantId])
            warehouseId_variantId: {
                warehouseId: warehouseId,
                variantId: variantId
            }
        }
    });

    if (existingInventory) {
        // Update existing inventory

        const newStockIn = existingInventory.stockIn + unitsReceived;
        // 1. First, calculate the number of good, sellable units.
        const goodUnits = unitsReceived - unitsDamaged;
        // 2. Calculate the new total for stock loss, including the newly damaged units.
        const newStockLossCount = existingInventory.stockLossCount + unitsDamaged;        // 3. Calculate the new total cost based on ONLY the good units received.
        // The cost of damaged goods is logged but does not add to the inventory's value.
        const newTotalCost = existingInventory.totalCost + (unitsReceived * unitCostPrice);
        // 4. Recalculate the True Cost Price (Average Cost) using your formula.
        const newTrueCostPrice = newTotalCost / newStockIn; // Recalculate average cost
        // 5. Recalculate the Current Stock. It only increases by the number of good units received.
        const newCurrentStock = existingInventory.currentStock + goodUnits;

        return await model.update({
            where: {
                warehouseId_variantId: { // Use composite key for update
                    warehouseId: warehouseId,
                    variantId: variantId
                }
            },
            data: {
                stockIn: newStockIn,
                stockLossCount: newStockLossCount,
                currentStock: newCurrentStock,
                latestQuantityAdded: unitsReceived, // Track the most recent addition
                totalCost: newTotalCost,
                trueCostPrice: newTrueCostPrice,
                lastRestocked: new Date()
            }
        });
    } else {
        console.log(data);
        console.log("existingInventory", existingInventory)
        // Create new inventory record
        const createData = {
            id: uuidv4(),
            plantId, // Will be null for pots, which is correct
            variantId,
            potCategoryId, // Will be null for plants
            stockIn: units,
            currentStock: units,
            latestQuantityAdded: units,
            totalCost: units * unitCostPrice,
            trueCostPrice: unitCostPrice,
            lastRestocked: new Date(),

            // ---: Initialize other fields to their default state (0) ---
            stockOut: 0,
            stockLossCount: 0,
            reservedUnit: 0,
            sellingPrice: 0, // Should be set later by an admin
            profitMargin: 0,   // Will be calculated when sellingPrice is set
        };
        return await model.create({ data: createData });
    }
};

module.exports = {
    findAdminByUserId,
    findPurchaseOrdersByAdmin,
    createPaymentAndUpdateOrder,
    checkPurchaseOrderExist,
    updateOrderStatus,
    addMediaToPurchaseOrder,
    createPlantRestockLog,
    findHistoricalPurchaseOrders,
    createDamageLog,
    createRestockLog,
    updateWarehouseInventory
};

// PCOD-25-5C5DB89-0064