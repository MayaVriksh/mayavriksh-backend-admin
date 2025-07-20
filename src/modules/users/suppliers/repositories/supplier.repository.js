const prisma = require("../../../../config/prisma.config.js");

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
const findPurchaseOrdersBySupplier = async (supplierId, { page, search, itemsPerPage }) => {
    const whereClause = {
        supplierId: supplierId,
        ...(search && {
            id: { contains: search, mode: 'insensitive' }
        })
    };

    // Use a transaction to run both queries at the same time for efficiency.
    return await prisma.$transaction([
        prisma.purchaseOrder.count({ where: whereClause }),
        prisma.purchaseOrder.findMany({
            where: whereClause,
            skip: (page - 1) * itemsPerPage,
            take: itemsPerPage,
            orderBy: { requestedAt: 'desc' },
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
                                        hexCode: true,
                                    }
                                },
                                plantVariantImages: { // This is the relation name
                                    where: { isPrimary: true }, // Filter for the primary image
                                    take: 1, // We only need one
                                    select: { mediaUrl: true } // Select just the URL
                                }
                            },
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
                                images: { // This is the relation name for pot variant images
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
                    },
                    // orderBy: {
                    //     // Show the payments in chronological order
                    //     requestedAt: 'asc'
                    // }
                }
            }
        })
    ]);
};

// In src/modules/users/suppliers/services/supplier.service.js

// const getOrderRequestById = async ({ userId, orderId }) => {
//     // First, find the supplierId from the userId.
//     const supplier = await prisma.supplier.findUnique({
//         where: { userId: userId },
//         select: { supplierId: true }
//     });

//     if (!supplier) {
//         throw { code: 404, message: "Supplier profile not found for this user." };
//     }
    
//     // Now, find the purchase order, ensuring it matches BOTH the orderId AND the supplierId.
//     // This is a critical security check to prevent suppliers from viewing each other's orders.
//     const order = await prisma.purchaseOrder.findFirst({
//         where: {
//             id: orderId,
//             supplierId: supplier.supplierId
//         },
//         select: {
//             // Select all the fields you need for the details page
//             id: true,
//             status: true,
//             totalCost: true,
//             pendingAmount: true,
//             paymentPercentage: true,
//             expectedDateOfArrival: true,
//             PurchaseOrderItems: {
//                 select: {
//                     id: true,
//                     productType: true,
//                     unitsRequested: true,
//                     unitCostPrice: true,
//                     plant: { select: { name: true } },
//                     // ... and all other nested details you need
//                 }
//             },
//             payments: {
//                 orderBy: { paidAt: 'asc' }
//             }
//         }
//     });

//     if (!order) {
//         throw { code: 404, message: "Purchase Order not found or you do not have permission to view it." };
//     }

//     return { success: true, code: 200, data: order };
// };


module.exports = {
    findSupplierByUserId,
    findPurchaseOrdersBySupplier,
    // getOrderRequestById
};







// return await prisma.$transaction([
//         prisma.purchaseOrder.count({ where: whereClause }),
//         prisma.purchaseOrder.findMany({
//             where: whereClause,
//             skip: (page - 1) * itemsPerPage,
//             take: itemsPerPage,
//             orderBy: { requestedAt: 'desc' },
//             select: {
//                 // This is the complete select statement from our previous discussion
//                 id: true,
//                 totalCost: true,
//                 pendingAmount: true,
//                 paymentPercentage: true,
//                 status: true,
//                 isAccepted: true,
//                 expectedDateOfArrival: true,
//                 requestedAt: true,
//                 acceptedAt: true,
//                 deliveredAt: true,
//                 supplierReviewNotes: true,
//                 warehouseManagerReviewNotes: true,
//                 // Now, fetch all related items for the details modal
//                 PurchaseOrderItems: {
//                     select: {
//                         id: true,
//                         productType: true,
//                         unitsRequested: true,
//                         unitCostPrice: true,
//                         isAccepted: true,
//                         // Include Plant details if the item is a Plant
//                         plant: {
//                             select: { name: true }
//                         },
//                         plantVariant: {
//                             select: { 
//                                 plantSize: true,
//                                 sku: true, 
//                                 /** mediaUrl:true */
//                                 color: {
//                                     select: {
//                                         name: true,
//                                         hexCode: true,
//                                     }
//                                 },
//                                 plantVariantImages: { // This is the relation name
//                                     where: { isPrimary: true }, // Filter for the primary image
//                                     take: 1, // We only need one
//                                     select: { mediaUrl: true } // Select just the URL
//                                 }
//                             },
//                         },
//                         potVariant: {
//                             select: {
//                                 potName: true,
//                                 size: true,
//                                 sku: true,
//                                 // --- ADDED: Include the nested material name for pots ---
//                                 material: {
//                                     select: {
//                                         name: true
//                                     }
//                                 },
//                                 color: {
//                                     select: {
//                                         name: true,
//                                         hexCode: true
//                                     }
//                                 },
//                                 images: { // This is the relation name for pot variant images
//                                     where: { isPrimary: true },
//                                     take: 1,
//                                     select: { mediaUrl: true }
//                                 }
//                             }
//                         }
//                     }
//                 },
//                 payments: {
//                     select: {
//                         paymentId: true,
//                         amount: true,
//                         paymentMethod: true,
//                         status: true,
//                         receiptUrl: true,
//                         paidAt: true,
//                         remarks: true
//                     },
//                     // orderBy: {
//                     //     // Show the payments in chronological order
//                     //     requestedAt: 'asc'
//                     // }
//                 }
//             }
//         })
//     ]);
// };