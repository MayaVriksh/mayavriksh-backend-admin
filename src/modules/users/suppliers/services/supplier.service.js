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

const completeSupplierProfile = async (userId, profileData, mediaAssets) => {
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
        warehouseId,
        tradeLicenseUrl
    } = profileData;

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
                    code: RESPONSE_CODES.CONFLICT, // Use 409 Conflict for duplicates
                    message: ERROR_MESSAGES.SUPPLIERS.GSTIN_ALREADY_EXISTS
                };
            }
        }

        // --- MODIFIED: Update the User's address JSON blob ---
        // We are only updating the address here, not other User fields.
        await tx.user.update({
            where: { userId },
            data: {
                address: {
                    streetAddress,
                    landmark,
                    city,
                    state,
                    country,
                    pinCode,
                }
            }
        });

        // This update to the Supplier table is correct.
        const supplierProfile = await tx.supplier.update({
            where: { userId },
            data: {
                nurseryName,
                gstin,
                businessCategory,
                warehouseId,
                tradeLicenseUrl,
                status: "UNDER_REVIEW", // Set status for admin verification
                isVerified: false       // Explicitly set to false until admin approval
            }
        });

        // This logic to save media assets is correct and now complete.
        if (mediaAssets && mediaAssets.length > 0) {
            const mediaData = mediaAssets.map(asset => ({
                id: uuidv4(),
                supplierId: supplierProfile.supplierId,
                mediaUrl: asset.mediaUrl,
                mediaType: asset.mediaType,
                // Make sure your Cloudinary helper returns publicId if you need it
                publicId: asset.publicId || 'default_public_id', 
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
    listAllWarehouses,
    updateSupplierProfile
};
