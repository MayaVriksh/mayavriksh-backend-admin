const util = require("util");
const { v4: uuidv4 } = require("uuid");
const { prisma } = require("../../../../config/prisma.config.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant");
const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant");
const SUCCESS_MESSAGES = require("../../../../constants/successMessages.constant.js");
const supplierRepository = require("../repositories/supplier.repository.js");
const orderEvents = require("../../../../events/order.events.js");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");
const ROLES = require("../../../../constants/roles.constant.js");

const showSupplierProfile = async (userId) => {
    const profile = await prisma.supplier.findUnique({
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
            },
            warehouse: {
                select: {
                    warehouseId: true,
                    name: true,
                    officeEmail: true,
                    officePhone: true,
                    officeAddress: true
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

const completeSupplierProfile = async (
    userId,
    profileFields,
    tradeLicenseData,
    profileImageData,
    nurseryMediaAssets
) => {
    // --- MODIFIED: Destructure only the fields we receive from the controller ---
    const {
        nurseryName,
        streetAddress,
        landmark,
        city,
        state,
        country,
        pinCode,
        gstin,
        businessCategory,
        warehouseId
    } = profileFields;
    return await prisma.$transaction(
        async (tx) => {
            // --- REMOVED: Phone number validation ---
            // This check is no longer needed here because the phone number was
            // validated during the initial signup.

            // This GSTIN check is still relevant and correct for this step.
            if (gstin) {
                const existingGSTIN = await tx.supplier.findFirst({
                    where: { gstin, NOT: { userId } }
                });
                if (existingGSTIN) {
                    throw {
                        success: RESPONSE_FLAGS.FAILURE,
                        code: RESPONSE_CODES.CONFLICT, // Use 409 Conflict for duplicates
                        message: ERROR_MESSAGES.SUPPLIERS.GSTIN_ALREADY_EXISTS
                    };
                }
            }
            // --- MODIFIED: Update the User's address JSON blob ---
            // We are only updating the address here, not other User fields. Here
            await tx.user.update({
                where: {
                    userId,
                    isActive: true,
                    deletedAt: null
                },
                data: {
                    address: {
                        streetAddress,
                        landmark,
                        city,
                        state,
                        country,
                        pinCode
                    },
                    ...(profileImageData && {
                        profileImageUrl: profileImageData.mediaUrl,
                        publicId: profileImageData.publicId
                    })
                }
            });

            // This update to the Supplier table is correct.
            const supplierProfile = await tx.supplier.update({
                where: {
                    userId,
                    isVerified: false,
                    deletedAt: null
                },
                data: {
                    nurseryName,
                    gstin,
                    businessCategory,
                    warehouseId,
                    tradeLicenseUrl: tradeLicenseData.mediaUrl,
                    publicId: tradeLicenseData.publicId,
                    status: ORDER_STATUSES.UNDER_REVIEW, // Set status for admin verification
                    isVerified: false // Explicitly set to false until admin approval
                }
            });

            if (
                Array.isArray(nurseryMediaAssets) &&
                nurseryMediaAssets.length > 0
            ) {
                const mediaData = nurseryMediaAssets.map((asset) => ({
                    id: uuidv4(),
                    supplierId: supplierProfile.supplierId,
                    mediaUrl: asset.mediaUrl,
                    mediaType: asset.mediaType,
                    publicId: asset.publicId,
                    resourceType: asset.resourceType || null,
                    isPrimary: asset.isPrimary || false
                }));

                await tx.nurseryMediaAsset.createMany({
                    data: mediaData
                });
            }

            return {
                success: RESPONSE_FLAGS.SUCCESS,
                code: RESPONSE_CODES.SUCCESS,
                message: SUCCESS_MESSAGES.SUPPLIERS.PROFILE_SUBMITTED_FOR_REVIEW
            };
        },
        {
            // maxWait: 20000,
            timeout: 15000
        }
    );
};

const listAllWarehouses = async () => {
    // Fetch only the ID and name for the dropdown, and only where not deleted.
    const warehouses = await prisma.warehouse.findMany({
        select: {
            warehouseId: true,
            name: true
        },
        orderBy: {
            name: "asc"
        }
    });

    if (!warehouses) {
        throw { code: 404, message: "No warehouses found." };
    }

    return {
        success: true,
        code: 200,
        message: "Warehouses retrieved successfully.",
        data: warehouses
    };
};

const listSupplierOrders = async ({
    userId,
    page,
    limit,
    orderStatus,
    search,
    sortBy,
    order
}) => {
    // 1. Call the repository to get the supplier ID.
    const supplier = await supplierRepository.findSupplierByUserId(userId);

    // 2. Handle the business case where the user is not a supplier.
    if (!supplier) {
        return {
            success: true,
            code: 200,
            message: "Supplier profile not found for this user.",
            data: { orders: [], totalPages: 0, currentPage: page }
        };
    }

    // 3. Call the repository to get the purchase order data.
    const [totalItems, rawOrders] =
        await supplierRepository.findPurchaseOrdersBySupplier(
            supplier.supplierId,
            { page, limit, orderStatus, search, sortBy, order }
        );

    // --- Transform the raw database results into a clean, generic structure ---
    const transformedOrders = rawOrders.map((order) => {
        // --- Object 2: For the "View Payments Modal" ---
        let runningTotalPaid = 0;
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

        // Determine the generic properties based on the productType
        // --- Object 3: For the "Order Items Modal" ---
        const orderItems = order.PurchaseOrderItems.map((item) => {
            const isPlant = item.productType === "PLANT";
            const productVariantName = isPlant
                ? item.plant?.name
                : item.potVariant?.potName;
            const productVariantSize = isPlant
                ? item.plantVariant?.size?.plantSize
                : item.potVariant?.size;
            const sku = isPlant ? item.plantVariant?.sku : item.potVariant?.sku;
            const productVariantColor = isPlant
                ? item.plantVariant?.color?.name
                : item.potVariant?.color?.name;
            const productVariantMaterial = isPlant
                ? "NaturalPlant"
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
        // Return the order with the transformed items array
        console.log(
            "Supplier-service.js --> listSupplierOrders: ",
            paymentHistory,
            orderItems
        );
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

const updateSupplierProfile = async (userId, updateData, profileImageUrl) => {
    return await prisma.$transaction(async (tx) => {
        const {
            email,
            phoneNumber,
            streetAddress,
            landmark,
            city,
            state,
            country,
            pinCode,
            latitude,
            longitude,
            businessCategory,
            warehouseId
        } = updateData;

        // Check phone number uniqueness
        if (phoneNumber) {
            const existingUsers = await tx.user.findMany({
                where: {
                    phoneNumber,
                    NOT: { userId }
                }
            });

            if (existingUsers.length > 0) {
                throw {
                    success: RESPONSE_FLAGS.FAILURE,
                    code: RESPONSE_CODES.BAD_REQUEST,
                    message: ERROR_MESSAGES.AUTH.PHONE_ALREADY_EXISTS
                };
            }
        }

        // Check email uniqueness
        if (email) {
            const existingEmailUsers = await tx.user.findMany({
                where: {
                    email,
                    NOT: { userId }
                }
            });

            if (existingEmailUsers.length > 0) {
                throw {
                    success: RESPONSE_FLAGS.FAILURE,
                    code: RESPONSE_CODES.BAD_REQUEST,
                    message: ERROR_MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED
                };
            }
        }

        // Prepare address only if at least one field is provided
        const hasAddressFields =
            streetAddress ||
            landmark ||
            city ||
            state ||
            country ||
            pinCode ||
            latitude ||
            longitude;

        // Update User Table
        await tx.user.update({
            where: { userId, isActive: true, deletedAt: null },
            data: {
                ...(email && { email }),
                ...(phoneNumber && { phoneNumber }),
                ...(hasAddressFields && {
                    address: {
                        ...(streetAddress && { streetAddress }),
                        ...(landmark && { landmark }),
                        ...(city && { city }),
                        ...(state && { state }),
                        ...(country && { country }),
                        ...(pinCode && { pinCode }),
                        ...(latitude && { latitude }),
                        ...(longitude && { longitude })
                    }
                }),
                ...(profileImageData && {
                    profileImageUrl: profileImageData.mediaUrl,
                    publicId: profileImageData.publicId
                })
            }
        });

        // Update Supplier Table
        await tx.supplier.update({
            where: { userId, deletedAt: null },
            data: {
                ...(businessCategory && { businessCategory }),
                ...(warehouseId && { warehouseId })
            }
        });

        return {
            success: RESPONSE_FLAGS.SUCCESS,
            code: RESPONSE_CODES.SUCCESS,
            message: SUCCESS_MESSAGES.SUPPLIERS.PROFILE_UPDATED
        };
    });
};

/**
 * Saves QC media metadata to a Purchase Order after verifying ownership.
 * @param {object} params
 * @param {string} params.userId - The ID of the authenticated supplier user.
 * @param {string} params.orderId - The ID of the Purchase Order.
 * @param {Array<object>} params.uploadedMedia - An array of { url, publicId, mimeType } objects from the successful upload.
 * @returns {Promise<object>} A success message.
 */
const uploadQcMediaForOrder = async ({ userId, orderId, uploadedMedia }) => {
    // 1. Security Check: Ensure the order belongs to the logged-in supplier.
    const supplier = await prisma.supplier.findUnique({ where: { userId } });
    if (!supplier) {
        throw { code: 404, message: "Supplier profile not found." };
    }
    const purchaseOrder = supplierRepository.checkPurchaseOrderExist(
        orderId,
        supplier.supplierId
    );

    if (!purchaseOrder) {
        throw {
            code: 403,
            message:
                "Access denied. This purchase order does not belong to you."
        };
    }

    /** Uploading Order status to SHipped */
    supplierRepository.updateOrderStatus(orderId);

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
        uploadedBy: ROLES.ROLES.SUPPLIER
    }));

    // 3. Save the URLs and public IDs to the database via the repository.
    await supplierRepository.addMediaToPurchaseOrder(
        orderId,
        mediaAssetsToCreate
    );

    return {
        success: true,
        code: 201,
        message: "QC media uploaded successfully."
        // data: mediaAssetsToCreate
    };
};

// Add this new function to your supplier service file

const reviewPurchaseOrder = async ({ userId, orderId, reviewData }) => {
    // 1. Security Check: The repository will verify ownership ??
    // --- 1. Security Check: Verify ownership of the Purchase Order ---
    return await prisma.$transaction(
        async (tx) => {
            // 1. Security Check: Verify the supplier owns this order.
            const supplier = await tx.supplier.findUnique({
                where: { userId }
            });
            if (!supplier)
                throw {
                    code: 403,
                    message: "Access Denied: Supplier profile not found."
                };

            console.log(supplier, orderId);
            const orderToReview = await tx.purchaseOrder.findFirst({
                where: { id: orderId, supplierId: supplier.supplierId }
            });
            console.log(orderToReview);
            if (!orderToReview)
                throw { code: 404, message: "Access Denied: Order not found." };

            // Check to ensure the API request can't review an already processed order as status will not be PENDING anymore for them.
            if (orderToReview.status !== ORDER_STATUSES.PENDING) {
                throw {
                    code: 400,
                    message: `This order is already in '${orderToReview.status}' status and cannot be reviewed.`
                };
            }
            // 2. Handle the "Reject Entire Order" case
            if (reviewData.status === "REJECTED") {
                await supplierRepository.rejectEntireOrder(orderId, tx);
                return {
                    success: true,
                    code: 200,
                    message: "Order has been rejected successfully."
                };
            }

            // 3. Handle the "Processing" (Full or Partial Accept) case
            if (reviewData.status === "PROCESSING") {
                // Get ALL items for this order from the database to ensure data integrity.
                const allItemsInOrder = await tx.purchaseOrderItems.findMany({
                    where: { purchaseOrderId: orderId }
                });

                // Securely recalculate the new total cost on the backend.
                // We NEVER trust a total cost sent from the frontend.
                const newTotalCost = allItemsInOrder.reduce((sum, item) => {
                    // If the item's ID is NOT in the rejected list, add its cost to the total.
                    if (!reviewData.rejectedOrderItemsIdArr.includes(item.id)) {
                        return (
                            sum +
                            Number(item.unitCostPrice) * item.unitsRequested
                        );
                    }
                    return sum;
                }, 0);
                console.log(newTotalCost);
                await supplierRepository.updateOrderAfterReview({
                    orderId,
                    rejectedItemIds: reviewData.rejectedOrderItemsIdArr,
                    newTotalCost,
                    tx
                });
                // --- Step 3 (NEW): Re-fetch and return the updated order's full state ---
                // After the transaction is successful, fetch the final, authoritative state of the order.
                const updatedOrder = await prisma.purchaseOrder.findUnique({
                    where: { id: orderId },
                    // Use the same comprehensive select as your 'getOrderById' function
                    select: {
                        id: true,
                        totalCost: true,
                        pendingAmount: true,
                        paymentPercentage: true,
                        status: true,
                        isAccepted: true,
                        /// Include the full list of items with their new statuses
                        PurchaseOrderItems: {
                            select: {
                                id: true,
                                isAccepted: true, // This will be the new true/false value
                                productType: true
                                // Add any other item fields your 'View Items' modal needs
                            }
                        }
                    }
                });
                // 4. Trigger notification to Warehouse Manager (e.g., using an event emitter) will be implemented later
                // orderEvents.emit('order.reviewed', { orderId, newTotalCost });
                return {
                    success: true,
                    code: 200,
                    message: "Order review submitted successfully.",
                    data: updatedOrder // Return the single, fresh object
                };
            }
        },
        {
            // Sets the maximum time Prisma will wait for a connection from the pool.
            // maxWait: 10000, // 10 seconds (default is 2s)
            // Sets the maximum time the entire transaction is allowed to run.
            timeout: 15000 // 15 seconds (default is 5s)
        }
    );
};

const getOrderRequestByOrderId = async ({ userId, orderId }) => {
    // First, find the supplierId from the userId.
    const supplier = await prisma.supplier.findUnique({
        where: { userId: userId },
        select: { supplierId: true }
    });

    if (!supplier) {
        throw {
            code: 404,
            message: "Supplier profile not found for this user."
        };
    }

    // Now, find the purchase order, ensuring it matches BOTH the orderId AND the supplierId.
    // This is a critical security check to prevent suppliers from viewing each other's orders.
    const order = await prisma.purchaseOrder.findFirst({
        where: {
            id: orderId,
            supplierId: supplier.supplierId
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

/**
 * Retrieves a paginated list of historical purchase orders for a supplier.
 */
const getSupplierOrderHistory = async ({
    userId,
    page,
    limit,
    orderStatus,
    search,
    sortBy,
    order
}) => {
    // 1. Get the supplierId for the logged-in user.
    const supplier = await supplierRepository.findSupplierByUserId(userId);
    // console.log("Supplier service: ", supplier);

    if (!supplier) {
        return {
            success: true,
            code: 200,
            message: "Supplier profile not found for this user.",
            data: { orders: [], totalPages: 0, currentPage: page }
        };
    }

    // 2. Call the NEW repository function for historical orders.
    const [totalItems, rawOrders] =
        await supplierRepository.findHistoricalPurchaseOrders(
            supplier.supplierId,
            { page, limit, orderStatus, search, sortBy, order }
        );

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
            const isPlant = item.productType === "PLANT";
            const productVariantName = isPlant
                ? item.plant?.name
                : item.potVariant?.potName;
            const productVariantSize = isPlant
                ? item.plantVariant?.size?.plantSize
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
            },
            warehouse: {
                name: order.warehouse?.name ?? "N/A",
                address:
                    order.warehouse?.officeAddress ?? "Address not available",
                officePhone:
                    order.warehouse?.officePhone ?? "Phone No. not available",
                officeEmail:
                    order.warehouse?.officeEmail ?? "officeEmail not available"
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

const searchWarehousesByName = async (search) => {
    const trimmedSearch = search?.trim();

    if (!trimmedSearch || trimmedSearch.length < 1) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.WAREHOUSES.INVENTORY_FETCH_FAILED
        };
    }

    const matchedWarehouses = await prisma.warehouse.findMany({
        where: {
            name: {
                contains: trimmedSearch,
                mode: "insensitive"
            }
        },
        select: {
            warehouseId: true,
            name: true,
            officeAddress: true
        },
        orderBy: {
            name: "asc"
        }
    });

    return {
        success: RESPONSE_FLAGS.SUCCESS,
        code: RESPONSE_CODES.SUCCESS,
        message:
            matchedWarehouses.length > 0
                ? SUCCESS_MESSAGES.WAREHOUSES.MULTIPLE_WAREHOUSES_FETCHED
                : ERROR_MESSAGES.WAREHOUSES.WAREHOUSE_NOT_FOUND,
        data: matchedWarehouses
    };
};

module.exports = {
    showSupplierProfile,
    completeSupplierProfile,
    listAllWarehouses,
    listSupplierOrders,
    uploadQcMediaForOrder,
    reviewPurchaseOrder,
    getOrderRequestByOrderId,
    updateSupplierProfile,
    getSupplierOrderHistory
};
