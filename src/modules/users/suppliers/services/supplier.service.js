const { v4: uuidv4 } = require("uuid");
const prisma = require("../../../../config/prisma.config.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant");
const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant");
const SUCCESS_MESSAGES = require("../../../../constants/successMessages.constant.js");

const showSupplierProfile = async userId => {
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
                    name: true
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

const completeSupplierProfile = async (userId,
    profileFields,
    tradeLicenseData,
    profileImageData,
    nurseryMediaAssets) => {
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
    return await prisma.$transaction(async (tx) => {
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
                deletedAt: null},
            data: {
                address: {
                    streetAddress,
                    landmark,
                    city,
                    state,
                    country,
                    pinCode,
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
                deletedAt: null },
            data: {
                nurseryName,
                gstin,
                businessCategory,
                warehouseId,
                tradeLicenseUrl: tradeLicenseData.mediaUrl,
                publicId: tradeLicenseData.publicId,
                status: "UNDER_REVIEW", // Set status for admin verification
                isVerified: false       // Explicitly set to false until admin approval
            }
        });

            if (
                Array.isArray(nurseryMediaAssets) &&
                nurseryMediaAssets.length > 0
            ) {
                const mediaData = nurseryMediaAssets.map(asset => ({
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
            maxWait: 20000,
            timeout: 30000
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
            name: 'asc'
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

const listOrderRequests = async ({ userId, page = 1, search = '' }) => {
    const itemsPerPage = 8;
     // --- STEP 1: Find the supplierId from the userId ---
    // We first query the Supplier table to get the supplierId for the logged-in user.
    const supplier = await prisma.supplier.findUnique({
        where: { userId: userId },
        select: { supplierId: true }
    });
    console.log("xx",supplier)
    // If no supplier profile exists for this user, they have no orders.
    if (!supplier) {
        return {
            success: true,
            code: 200,
            message: "Supplier profile not found.",
            data: { orders: [], totalPages: 0, currentPage: 1 }
        };
    }
    const whereClause = {
        supplierId: supplier.supplierId, // Assuming a relation from PurchaseOrder to Supplier
        // Add search filter if a search term is provided
        ...(search && {
            id: { // Example: searching by product name
                contains: search,
                mode: 'insensitive'
            }
        })
    };
    console.log("yy",whereClause)
    // Fetch the total count for pagination
    const totalItems = await prisma.purchaseOrder.count({ where: whereClause });
    console.log("Items" + totalItems)
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    console.log(totalPages)


    // Fetch the paginated data
    const orders = await prisma.purchaseOrder.findMany({
        where: whereClause,
        skip: (page - 1) * itemsPerPage,
        take: itemsPerPage,
        orderBy: {
            requestedAt: 'desc'
        },
        // The 'include' block is now corrected to match your schema.
        include: {
            // For each PurchaseOrder, include its list of items.
            PurchaseOrderItems: {
                // We use 'select' here to pick fields from the PurchaseOrderItems model itself,
                // AND to include data from further related tables.
                select: {
                    // Fields from the PurchaseOrderItems model
                    productType: true,
                    unitsRequested: true,
                    unitCostPrice: true,
                    
                    // Data from related models needed for display
                    plant: { select: { name: true } },
                    plantVariant: { select: { plantSize: true } },
                    potCategory: { select: { name: true } },
                    potVariant: { select: { potName: true, size: true } },
                }
            }
        }
    });
    console.log(orders);
orders.forEach(order => {

    // Use JSON.stringify with a spacing of 2 for pretty-printing.
    console.log(JSON.stringify(order.PurchaseOrderItems, null, 2));

    console.log(`------------------------------------`);
});
    return {
        success: true,
        code: 200,
        message: "Order requests retrieved successfully.",
        data: {
            orders,
            totalPages,
            currentPage: page
        }
    };
};


const updateSupplierProfile = async (userId, updateData, profileImageUrl) => {
    return await prisma.$transaction(async tx => {
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

const searchWarehousesByName = async search => {
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
    listOrderRequests,
    updateSupplierProfile
};
