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

const completeSupplierProfile = async (
    userId,
    profileFields,
    tradeLicenseData,
    profileImageData,
    nurseryMediaAssets
) => {
    const {
        nurseryName,
        streetAddress,
        landmark,
        city,
        state,
        country,
        pinCode,
        latitude,
        longitude,
        gstin,
        businessCategory,
        warehouseId
    } = profileFields;

    return await prisma.$transaction(
        async tx => {
            const existingGSTINs = await tx.supplier.findMany({
                where: {
                    gstin,
                    NOT: { userId }
                }
            });

            if (existingGSTINs.length > 0) {
                throw {
                    success: RESPONSE_FLAGS.FAILURE,
                    code: RESPONSE_CODES.BAD_REQUEST,
                    message: ERROR_MESSAGES.SUPPLIERS.GSTIN_ALREADY_EXISTS
                };
            }

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
                        pinCode,
                        latitude,
                        longitude
                    },
                    ...(profileImageData && {
                        profileImageUrl: profileImageData.mediaUrl,
                        publicId: profileImageData.publicId
                    })
                }
            });

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
                    status: "UNDER_REVIEW"
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

const updateSupplierProfile = async (userId, updateData, profileImageData) => {
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
    updateSupplierProfile,
    searchWarehousesByName
};
