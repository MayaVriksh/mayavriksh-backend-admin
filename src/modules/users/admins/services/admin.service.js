const { prisma, Prisma } = require("../../../../config/prisma.config.js");
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
const uploadMedia = require("../../../../utils/uploadMedia.js");
const { PRODUCT_TYPES } = require("../../../../constants/general.constant.js");

const showAdminProfile = async (userId) => {
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

const getOrderRequestByOrderId = async ({ userId, orderId }) => {
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

const listSupplierOrders = async ({
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
            message: "Admin profile not found for this user.",
            data: { orders: [], totalPages: 0, currentPage: page }
        };
    }

    // 3. Call the repository to get the purchase order data.
    const [totalItems, rawOrders] = await adminRepo.findPurchaseOrdersByAdmin({
        page,
        limit,
        search,
        sortBy,
        order
    });
    // --- Transform the raw database results into a clean, generic structure ---
    const transformedOrders = rawOrders.map((order) => {
        // --- Object 2: For the "View Payments Modal" ---
        let runningTotalPaid = 0;
        const paymentHistory = order.payments.map((payment) => {
            runningTotalPaid += payment.amount;
            return {
                paidAmount: payment.amount,
                // paymentStatus: order.payments.status,
                pendingAmountAfterPayment:
                    (order.totalCost || 0) - runningTotalPaid,
                paymentMethod: payment.paymentMethod,
                paymentStatus: payment.status,
                receiptUrl: payment.receiptUrl,
                publicId: payment.publicId,
                requestedAt: payment.requestedAt,
                paidAt: payment.paidAt,
                paymentRemarks: payment.remarks,
                transactionId: payment.transactionId
            };
        });
        // Determine the generic properties based on the productType
        // --- Object 3: For the "Order Items Modal" ---
        const orderItems = order.PurchaseOrderItems.map((item) => {
            const isPlant = item.productType === PRODUCT_TYPES.PLANT;
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
            requestedAt: order.requestedAt,
            // The two transformed arrays
            orderItems: orderItems,
            payments: paymentHistory
        };
    });
    transformedOrders.forEach((order) => {
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

const deleteFromCloudinary = async (publicId) => {
    // You should implement this using your Cloudinary SDK or utility
    // Example:
    // const cloudinary = require('cloudinary').v2;
    // await cloudinary.uploader.destroy(publicId);
    // For now, just log for placeholder
    console.log(`Deleting orphaned file from Cloudinary: ${publicId}`);
};

const recordPaymentForOrder = async ({
    orderId,
    paidByUserId,
    paymentDetails,
    receiptFile
}) => {
    let receiptUrl = null;
    let publicId = null;
    try {
        // Step 1: Upload the receipt file (if any) BEFORE the transaction
        if (receiptFile) {
            const uploadResult = await uploadMedia({
                files: receiptFile,
                folder: `admins/receipts/PCOD_${orderId}`,
                publicIdPrefix: `receipt_${Date.now()}`
            });
            if (!uploadResult.success)
                throw new Error("Receipt upload failed.");
            receiptUrl = uploadResult.data.mediaUrl;
            console.log(receiptUrl);
        }

        // Step 2: Run the transaction for all DB operations
        return await prisma.$transaction(async (tx) => {
            const order = await tx.purchaseOrder.findUnique({
                where: { id: orderId },
                select: {
                    totalCost: true,
                    pendingAmount: true,
                    status: true,
                    isAccepted: true
                }
            });
            const checkUserActive = await tx.User.findUnique({
                where: { userId: paidByUserId },
                select: { isActive: true }
            });
            if (!checkUserActive)
                throw {
                    code: 404,
                    message: "User is not active or doesnot exist."
                };
            if (!order)
                throw { code: 404, message: "Purchase Order not found." };
            if ((order.pendingAmount || 0) <= 0)
                throw {
                    code: 400,
                    message: "This order is already fully paid."
                };
            if (order.status === "PENDING")
                throw {
                    code: 400,
                    message:
                        "The Order is to be accepted yet by Supplier for Payment"
                };
            if (order.isAccepted === false)
                throw {
                    code: 400,
                    message:
                        "Trying to make payment on an order that has not been accepted by admin"
                };

            const existingPaymentCount = await tx.purchaseOrderPayment.count({
                where: {
                    orderId: orderId,
                    status: "PARTIALLY_PAID"
                }
            });

            const newTotalPaid =
                order.totalCost - order.pendingAmount + paymentDetails.amount;
            const newPendingAmount = order.totalCost - newTotalPaid;
            const newPaymentPercentage = Math.min(
                100,
                Math.round((newTotalPaid / order.totalCost) * 100)
            );
            const newPaymentStatus =
                newPendingAmount <= 0 ? "PAID" : "PARTIALLY_PAID";
            const finalRemarks =
                newPendingAmount <= 0 && finalRemarks === "INSTALLMENT"
                    ? "COMPLETED"
                    : `INSTALLMENT_${existingPaymentCount + 1}`;

            let newOrderStatus = order.status;
            if (order.status === "PROCESSING") {
                newOrderStatus = "SHIPPING";
            }

            await tx.purchaseOrderPayment.create({
                data: {
                    paymentId: uuidv4(),
                    orderId: orderId,
                    paidBy: paidByUserId,
                    amount: paymentDetails.amount,
                    paymentMethod: paymentDetails.paymentMethod,
                    transactionId: paymentDetails.transactionId,
                    remarks: finalRemarks,
                    receiptUrl: receiptUrl,
                    status: newPaymentStatus,
                    paidAt: new Date()
                }
            });

            const updatedPurchaseOrder = await tx.purchaseOrder.update({
                where: { id: orderId },
                data: {
                    pendingAmount: newPendingAmount,
                    paymentPercentage: newPaymentPercentage,
                    status: newOrderStatus
                }
            });

            console.log(newPaymentStatus, finalRemarks);
            return {
                success: true,
                code: 201,
                message: "Payment recorded successfully.",
                data: updatedPurchaseOrder
            };
        });
    } catch (err) {
        // If transaction fails and file was uploaded, delete from Cloudinary
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }
        throw err;
    }
};

/**
 * Saves QC media metadata to a Purchase Order after verifying ownership.
 * @param {object} params
 * @param {string} params.userId - The ID of the authenticated admin user.
 * @param {string} params.orderId - The ID of the Purchase Order.
 * @param {Array<object>} params.uploadedMedia - An array of { url, publicId, mimeType } objects from the successful upload.
 * @returns {Promise<object>} A success message.
 */
const uploadQcMediaForOrder = async ({ userId, orderId, uploadedMedia }) => {
    // 1. Security Check: Ensure the order belongs to the logged-in admin.
    const admin = await prisma.admin.findUnique({ where: { userId } });
    if (!admin) {
        throw { code: 404, message: "Admin profile not found." };
    }
    const purchaseOrder = adminRepo.checkPurchaseOrderExist(orderId);

    if (!purchaseOrder) {
        throw {
            code: 403,
            message:
                "Access denied. This purchase order does not belong to you."
        };
    }

    /** Uploading Order status to SHipped */
    adminRepo.updateOrderStatus(orderId);

    // 2. Prepare the data for the database.
    const mediaArray = Array.isArray(uploadedMedia)
        ? uploadedMedia
        : [uploadedMedia];
    const mediaAssetsToCreate = mediaArray.map((media) => ({
        mediaUrl: media.mediaUrl,
        publicId: media.publicId,
        mediaType: media.mediaType,
        resourceType: media.resourceType,
        isPrimary: media.isPrimary || false,
        uploadedBy: ROLES.ROLES.ADMIN
    }));

    // 3. Save the URLs and public IDs to the database via the repository.
    await adminRepo.addMediaToPurchaseOrder(orderId, mediaAssetsToCreate);

    return {
        success: true,
        code: 201,
        message: "QC media uploaded successfully."
        // data: mediaAssetsToCreate
    };
};

/**
 * Retrieves a paginated list of historical purchase orders for a supplier.
 */
const getSupplierOrderHistory = async ({
    userId,
    page,
    limit,
    search,
    sortBy,
    order
}) => {
    // 1. Get the adminId for the logged-in user.
    const admin = await adminRepo.findAdminByUserId(userId);
    console.log("admin", admin);
    if (!admin) {
        return {
            success: true,
            code: 200,
            message: "Admin profile not found for this user.",
            data: { orders: [], totalPages: 0, currentPage: page }
        };
    }
    // 2. Call the NEW repository function for historical orders.
    const [totalItems, rawOrders] =
        await adminRepo.findHistoricalPurchaseOrders({
            page,
            limit,
            search,
            sortBy,
            order
        });
    // 3. Perform the EXACT SAME data transformation as listSupplierOrders.
    //    This provides a consistent data structure to the frontend.
    const transformedOrders = rawOrders.map((order) => {
        // --- Object 2: For the "View Payments Modal" ---
        let runningTotalPaid = 0;
        // ... transform payment history ...
        const paymentHistory = order.payments.map((payment) => {
            runningTotalPaid += payment.amount;
            return {
                paidAmount: payment.amount,
                pendingAmountAfterPayment:
                    (order.totalCost || 0) - runningTotalPaid,
                paymentMethod: payment.paymentMethod,
                paymentStatus: payment.status,
                receiptUrl: payment.receiptUrl,
                publicId: payment.publicId,
                requestedAt: payment.requestedAt,
                paidAt: payment.paidAt,
                paymentRemarks: payment.remarks,
                transactionId: payment.transactionId
            };
        });
        const orderItems = order.PurchaseOrderItems.map((item) => {
            const isPlant = item.productType === PRODUCT_TYPES.PLANT;
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
                unitCostPrice: item.unitCostPrice,
                unitRequested: item.unitsRequested,
                totalVariantCost:
                    Number(item.unitsRequested) * Number(item.unitCostPrice),
                isAccepted
            };
        });

        const invoiceUserDetails = {
            // Currently Supplier not being used,as Supplier need not see his own details in oDRER suMMARY.
            // bUT THIS INFO WILL BE USED, WHILE DOWNLOADING THE RECEIPT FOR wAREHOUSE, AND SIGN THERE, AND SEND TO US AFTER DELIVERY
            supplier: {
                name: order.supplier?.nurseryName ?? "N/A",
                gstin: order.supplier?.gstin ?? "N/A",
                address:
                    order.supplier?.user?.address ?? "Address not available",
                phoneNumber:
                    order.supplier?.user?.phoneNumber ??
                    "phoneNumber not available"
            }
        };

        // Return the final, structured object for this order
        return {
            // All top-level fields from the PurchaseOrder
            id: order.id,
            totalOrderCost: order.totalCost,
            pendingAmount: order.pendingAmount,
            paymentPercentage: order.paymentPercentage,
            expectedDOA: order.expectedDateOfArrival,
            orderStatus: order.status,
            requestedAt: order.requestedAt,
            acceptedAt: order.acceptedAt,
            deliveredAt: order.deliveredAt,
            // The transformed arrays
            invoiceUserDetails: invoiceUserDetails,
            orderItems: orderItems,
            payments: paymentHistory
        };
    });
    transformedOrders.forEach((order) => {
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

const restockInventory = async ({
    orderId,
    handledById,
    handledBy,
    payload
}) => {
    console.log("restockInventory orderId: ", orderId);
    console.log("restockInventory handledById: ", handledById);
    console.log("restockInventory handledBy: ", handledBy);
    console.log("restockInventory Payload: ", payload);

    return await prisma.$transaction(
        async (tx) => {
            // Step 1: Fetch trusted Purchase Order and accepted items from the DB.
            const order = await tx.purchaseOrder.findFirst({
                where: { id: orderId, status: "DELIVERED" },
                include: { PurchaseOrderItems: { where: { isAccepted: true } } }
            });

            if (!order)
                throw { code: 404, message: "Purchase Order not found." };
            if (order.status !== "DELIVERED")
                throw {
                    code: 400,
                    message: "Order must be in 'DELIVERED' status."
                };
            console.log("Check Passed");

            // Step 2: Loop through each item submitted by the manager.
            for (const receivedItem of payload.items) {
                const originalItem = order.PurchaseOrderItems.find(
                    (p) => p.id === receivedItem.purchaseOrderItemId
                );
                console.log("Fetched originalItem", originalItem);
                if (!originalItem) {
                    throw {
                        code: 404,
                        message: "Purchase Order Item not found."
                    };
                }

                let mediaUrl =
                    "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif";
                let publicId = "xyz";
                // Step 3: Log Damaged Units, if any.
                if (receivedItem.unitsDamaged > 0) {
                    mediaUrl =
                        "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif";
                    publicId = "xyz";

                    /** Need to implement the Damage Photo Upload below*/
                    // if (
                    //     receivedItem.damagePhoto &&
                    //     receivedItem.damagePhoto.hapi.filename
                    // ) {
                    //     const uploadResult = await uploadMedia({
                    //         files: receivedItem.damagePhoto,
                    //         folder: `damaged-products/${order.id}`
                    //     });
                    //     mediaUrl = uploadResult.data.url;
                    //     publicId = uploadResult.data.publicId;
                    // }
                }
                const damageData = {
                    damageId: uuidv4(),
                    purchaseOrderId: originalItem.purchaseOrderId,
                    plantId: originalItem?.plantId,
                    plantVariantId: originalItem?.plantVariantId,
                    potCategoryId: originalItem?.potCategoryId,
                    potVariantId: originalItem?.potVariantId,
                    warehouseId: order.warehouseId,
                    purchaseOrderItemId: originalItem.id,
                    handledById: handledById,
                    handledBy: handledBy,
                    damageType: "SUPPLIER_DELIVERY",
                    unitsReceived: payload.unitsReceived,
                    unitsDamaged: receivedItem.unitsDamaged,
                    unitsDamagedPrice: originalItem.unitCostPrice,
                    totalAmount:
                        receivedItem.unitsDamaged *
                        Number(originalItem.unitCostPrice),
                    reason: receivedItem.damageReason,
                    notes: payload.warehouseManagerReviewNotes,
                    mediaUrl,
                    publicId
                };

                if (originalItem.productType === PRODUCT_TYPES.PLANT) {
                    damageData.plantId = originalItem.plantId;
                    damageData.plantVariantId = originalItem.plantVariantId;
                } else {
                    damageData.potCategoryId = originalItem.potCategoryId;
                    damageData.potVariantId = originalItem.potVariantId;
                }

                await adminRepo.createDamageLog(
                    originalItem.productType,
                    damageData,
                    tx
                );
                console.log("Damaged Data is stored successfully");

                // Step 4: Update Warehouse Inventory with only the good units.

                const usableUnits = Math.max(
                    0,
                    (receivedItem.unitsReceived || 0) -
                        (receivedItem.unitsDamaged || 0)
                );

                // Only update inventory if there's something to add
                if (usableUnits > 0) {
                    const { warehouseId } = order;
                    const {
                        productType,
                        unitCostPrice,
                        plantId,
                        plantVariantId,
                        potCategoryId,
                        potVariantId
                    } = originalItem;

                    const unitsReceived = receivedItem?.unitsReceived ?? 0;
                    const unitsDamaged = receivedItem?.unitsDamaged ?? 0;
                    const goodUnits = unitsReceived - unitsDamaged;

                    // Standardize costPrice as Decimal
                    const costPrice = new Prisma.Decimal(unitCostPrice ?? 0);

                    // Build unique where clause
                    let where;
                    if (productType === PRODUCT_TYPES.PLANT) {
                        where = {
                            plantId_variantId_warehouseId: {
                                plantId,
                                variantId: plantVariantId,
                                warehouseId
                            }
                        };
                    } else {
                        where = {
                            potCategoryId_potVariantId_warehouseId: {
                                potCategoryId,
                                potVariantId,
                                warehouseId
                            }
                        };
                    }

                    // Fetch existing inventory
                    const existingInventory =
                        productType === PRODUCT_TYPES.PLANT
                            ? await tx.plantWarehouseInventory.findUnique({
                                  where
                              })
                            : await tx.potWarehouseInventory.findUnique({
                                  where
                              });

                    let data;

                    if (existingInventory) {
                        console.log("Updating existing inventory:", {
                            id: existingInventory.id,
                            stockIn: existingInventory.stockIn,
                            currentStock: existingInventory.currentStock
                        });

                        // Int fields
                        const newStockIn =
                            Number(existingInventory.stockIn ?? 0) +
                            Number(unitsReceived);
                        const newStockLossCount =
                            Number(existingInventory.stockLossCount ?? 0) +
                            Number(unitsDamaged);
                        const newCurrentStock =
                            Number(existingInventory.currentStock ?? 0) +
                            Number(goodUnits);

                        // Decimal fields
                        const newTotalCost = new Prisma.Decimal(
                            existingInventory.totalCost ?? 0
                        ).plus(
                            new Prisma.Decimal(unitsReceived).times(costPrice)
                        );

                        const newTrueCostPrice =
                            newStockIn > 0
                                ? newTotalCost.div(newStockIn)
                                : new Prisma.Decimal(0);

                        data = {
                            stockIn: newStockIn,
                            stockLossCount: newStockLossCount,
                            currentStock: newCurrentStock,
                            latestQuantityAdded: Number(unitsReceived),
                            totalCost: newTotalCost,
                            trueCostPrice: newTrueCostPrice
                        };
                    } else {
                        console.log("Creating new inventory record");

                        data = {
                            id: uuidv4(),
                            stockIn: Number(unitsReceived),
                            currentStock: Number(goodUnits),
                            latestQuantityAdded: Number(unitsReceived),
                            totalCost: new Prisma.Decimal(unitsReceived).times(
                                costPrice
                            ),
                            trueCostPrice: costPrice,
                            ...(productType === PRODUCT_TYPES.PLANT
                                ? {
                                      plants: { connect: { plantId } },
                                      plantVariant: {
                                          connect: { variantId: plantVariantId }
                                      }
                                  }
                                : {
                                      potCategory: {
                                          connect: { id: potCategoryId }
                                      },
                                      potVariant: {
                                          connect: { id: potVariantId }
                                      }
                                  }),
                            warehouse: { connect: { warehouseId } }
                        };
                    }

                    // Repo handles update or create logic
                    await adminRepo.updateWarehouseInventory(
                        productType,
                        where,
                        data,
                        tx
                    );
                }

                // Step 5: Create an immutable Restock Event Log for received units.
                if ((receivedItem?.unitsReceived ?? 0) > 0) {
                    const {
                        supplierId,
                        warehouseId,
                        id: purchaseOrderId
                    } = order;

                    const {
                        productType,
                        unitCostPrice,
                        plantId,
                        plantVariantId,
                        potCategoryId,
                        potVariantId
                    } = originalItem;

                    const units = receivedItem?.unitsReceived ?? 0;
                    const costPrice = Number(unitCostPrice ?? 0);

                    const restockData = {
                        restockId: uuidv4(),
                        supplierId,
                        warehouseId,
                        purchaseOrderId,
                        units,
                        unitCostPrice: costPrice,
                        totalCost: units * costPrice
                    };

                    switch (productType) {
                        case PRODUCT_TYPES.PLANT:
                            restockData.plantId = plantId;
                            restockData.plantVariantId = plantVariantId;
                            break;
                        case PRODUCT_TYPES.POT:
                            restockData.potCategoryId = potCategoryId;
                            restockData.potVariantId = potVariantId;
                            break;
                        default:
                            throw new Error(
                                `Unsupported product type: ${productType}`
                            );
                    }

                    await adminRepo.createRestockLog(
                        productType,
                        restockData,
                        tx
                    );
                }
            }

            console.log("Stock updated.");

            return {
                success: true,
                code: 200,
                message: SUCCESS_MESSAGES.WAREHOUSES.STOCK_ADDED
            };
        },
        {
            // maxWait: 20000,
            timeout: 15000
        }
    );
};

module.exports = {
    showAdminProfile,
    listSupplierOrders,
    getSupplierOrderHistory,
    getOrderRequestByOrderId,
    recordPaymentForOrder,
    uploadQcMediaForOrder,
    restockInventory
};
