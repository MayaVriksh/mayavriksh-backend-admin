const prisma = require("../../../../config/prisma.config.js");
const { v4: uuidv4 } = require("uuid");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");

/**
 * Finds a supplier's ID based on their user ID.
 * @param {string} userId - The user's unique ID.
 * @returns {Promise<object|null>} The supplier object with their ID, or null if not found.
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

module.exports = {
    findAdminByUserId,
    findPurchaseOrdersByAdmin
};
