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
                    isActive: true
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

    if (!profile || !profile?.contactPerson?.isActive) {
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

const completeSupplierProfile = async (userId, updateData, mediaAssets) => {
    const {
        nurseryName,
        phoneNumber,
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
        warehouseId,
        tradeLicenseUrl
    } = updateData;

    return await prisma.$transaction(async tx => {
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

        if (gstin) {
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
        }

        await tx.user.update({
            where: {
                userId,
                isActive: true,
                deletedAt: null
            },
            data: {
                phoneNumber,
                address: {
                    streetAddress,
                    landmark,
                    city,
                    state,
                    country,
                    pinCode,
                    latitude,
                    longitude
                }
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
                tradeLicenseUrl,
                status: "UNDER_REVIEW"
            }
        });

        if (mediaAssets && mediaAssets.length > 0) {
            const mediaData = mediaAssets.map(asset => ({
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
    });
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
                ...(profileImageUrl && { profileImageUrl })
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

module.exports = {
    showSupplierProfile,
    completeSupplierProfile,
    updateSupplierProfile
};
