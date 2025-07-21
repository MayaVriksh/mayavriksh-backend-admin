const prisma = require("../../../config/prisma.config");
const bcrypt = require("bcrypt");
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken
} = require("../../../utils/jwt.util");
const generateCustomId = require("../../../utils/generateCustomId");
const { ROLES } = require("../../../constants/roles.constant");
const ERROR_MESSAGES = require("../../../constants/errorMessages.constant");
const {
    RESPONSE_FLAGS,
    RESPONSE_CODES
} = require("../../../constants/responseCodes.constant");
const SUCCESS_MESSAGES = require("../../../constants/successMessages.constant.js");

const register = async data => {
    const { firstName, lastName, email, phoneNumber, password, role } = data;

    return await prisma.$transaction(async tx => {
        const existingUserByEmail = await tx.user.findUnique({
            where: { email }
        });
        if (existingUserByEmail) {
            throw {
                success: RESPONSE_FLAGS.FAILURE,
                code: RESPONSE_CODES.BAD_REQUEST,
                message: ERROR_MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED
            };
        }

        const existingUserByPhone = await tx.user.findUnique({
            where: { phoneNumber }
        });
        if (existingUserByPhone) {
            throw {
                success: RESPONSE_FLAGS.FAILURE,
                code: RESPONSE_CODES.BAD_REQUEST,
                message: ERROR_MESSAGES.AUTH.PHONE_ALREADY_EXISTS
            };
        }

        const roleRecord = await tx.role.findUnique({ where: { role } });
        if (!roleRecord) {
            throw {
                success: RESPONSE_FLAGS.FAILURE,
                code: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                message: ERROR_MESSAGES.ROLES_PERMISSIONS.ROLE_ASSIGN_FAILED
            };
        }

        const userId = await generateCustomId(tx, ROLES.USER);
        const hashedPassword = await bcrypt.hash(password, 10);

        let roleEntityId;
        switch (role) {
            case ROLES.CUSTOMER:
                roleEntityId = await generateCustomId(tx, ROLES.CUSTOMER);
                break;
            case ROLES.ADMIN:
                roleEntityId = await generateCustomId(tx, ROLES.ADMIN);
                break;
            case ROLES.SUPER_ADMIN:
                roleEntityId = await generateCustomId(tx, ROLES.SUPER_ADMIN);
                break;
            case ROLES.SUPPLIER:
                roleEntityId = await generateCustomId(tx, ROLES.SUPPLIER);
                break;
            case ROLES.KEY_AREA_MANAGER:
            case ROLES.EMPLOYEE:
                roleEntityId = await generateCustomId(tx, ROLES.EMPLOYEE);
                break;
            default:
                throw {
                    success: RESPONSE_FLAGS.FAILURE,
                    code: RESPONSE_CODES.BAD_REQUEST,
                    message: ERROR_MESSAGES.AUTH.INVALID_REGISTRATION
                };
        }

        const createdUser = await tx.user.create({
            data: {
                userId,
                roleId: roleRecord.roleId,
                email,
                phoneNumber,
                password: hashedPassword,
                fullName: {
                    firstName,
                    lastName: lastName || ""
                }
            }
        });

        const roleEntityMap = {
            [ROLES.CUSTOMER]: {
                model: tx.customer,
                data: { customerId: roleEntityId, userId: createdUser.userId }
            },
            [ROLES.ADMIN]: {
                model: tx.admin,
                data: { adminId: roleEntityId, userId: createdUser.userId }
            },
            [ROLES.SUPER_ADMIN]: {
                model: tx.superAdmin,
                data: { superAdminId: roleEntityId, userId: createdUser.userId }
            },
            [ROLES.SUPPLIER]: {
                model: tx.supplier,
                data: { supplierId: roleEntityId, userId: createdUser.userId }
            },
            [ROLES.KEY_AREA_MANAGER]: {
                model: tx.employee,
                data: { employeeId: roleEntityId, userId: createdUser.userId }
            },
            [ROLES.EMPLOYEE]: {
                model: tx.employee,
                data: { employeeId: roleEntityId, userId: createdUser.userId }
            }
        };

        const handler = roleEntityMap[role];
        if (!handler) {
            throw {
                success: RESPONSE_FLAGS.FAILURE,
                code: RESPONSE_CODES.BAD_REQUEST,
                message: ERROR_MESSAGES.COMMON.ACTION_FAILED
            };
        }

        await handler.model.create({ data: handler.data });
    });
};

const login = async (email, password) => {
    console.log("In AuthService Page for Logging In");
    const user = await prisma.user.findUnique({
        where: { email },
        select: {
            userId: true,
            fullName: true,
            password: true,
            isActive: true,
            profileImageUrl: true,
            deletedAt: true,
            role: {
                select: {
                    role: true
                }
            },
            // Include the related Supplier model to get its 'isVerified' field.
            Supplier: {
                select: {
                    isVerified: true
                }
            }
        }
    });
    console.log("User Detail In AuthService Page for Logging In:", user);
    if (!user) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.UNAUTHORIZED,
            message: email
                ? ERROR_MESSAGES.AUTH.EMAIL_NOT_EXISTS
                : ERROR_MESSAGES.AUTH.PHONE_NOT_EXISTS
        };
    }

    if (!user.isActive || user.deletedAt) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE
        };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.UNAUTHORIZED,
            message: ERROR_MESSAGES.AUTH.PASSWORD_WRONG
        };
    }

    // <-- MODIFIED: Create two different payloads for our two tokens.

    // 1. Access Token Payload: Contains data for stateless verification.
    // This data will be available in our middleware and controllers without a DB query.
    const accessTokenPayload = {
        userId: user.userId,
        role: user.role.role,
        // Including a name is useful for the frontend.
        username: user.fullName.firstName,
        isVerified: user.Supplier?.isVerified || false
    };
    // 2. Refresh Token Payload: Should be minimal, only what's needed to identify the user session.
    const refreshTokenPayload = {
        userId: user.userId
    };

    // <-- MODIFIED: Generate both tokens using the new utility functions.
    const accessToken = generateAccessToken(accessTokenPayload);
    const refreshToken = generateRefreshToken(refreshTokenPayload);
    // Prepare user profile to be sent back to the client (remove sensitive info).
    const { password: _, deletedAt: __, ...userProfile } = user;
    // --- MERGE THE isVerified STATUS ---
    // Make sure to add the supplier's verification status to the final object.
    userProfile.isVerified = user.Supplier?.isVerified || false;

    // <-- MODIFIED: Return all the necessary pieces for the controller.
    return { userProfile, accessToken, refreshToken };
};

// --- NEW FUNCTION: REFRESH USER TOKEN ---
// This new service is called by the /auth/refresh-token endpoint.
const refreshUserToken = async token => {
    try {
        // 1. Verify the incoming refresh token. Throws an error if invalid/expired.
        const decoded = verifyRefreshToken(token);
        console.log(decoded);
        const userId = decoded.userId;
        // 2. IMPORTANT: Check the database to ensure the user is still valid.
        // This is our periodic security check. If a user was banned, this is where we catch it.
        const user = await prisma.user.findUnique({
            where: { userId: decoded.userId },
            select: {
                userId: true,
                isActive: true,
                deletedAt: true,
                role: { select: { role: true } },
                fullName: true,
                // The 'Supplier' relation MUST be nested inside the 'select' object.
                Supplier: {
                    select: {
                        isVerified: true
                    }
                }
            }
        });

        console.log(
            "User Detail In AuthService Page for Refresh User Token:",
            user
        );
        if (!user) {
            throw new Error(
                "User associated with this token no longer exists."
            );
        }
        if (!user.isActive || user.deletedAt) {
            throw new Error("User account is no longer active.");
        }
        // 3. If user is valid, issue a NEW access token with fresh data.
        const newAccessTokenPayload = {
            userId: user.userId,
            role: user.role.role,
            username: user.fullName.firstName,
            // This optional chaining (?.) safely handles non-supplier roles.
            // If user.Supplier is null (for an Admin), isVerified becomes false.
            isVerified: user.Supplier?.isVerified || false
        };
        const newAccessToken = generateAccessToken(newAccessTokenPayload);

        return { newAccessToken };
    } catch (error) {
        // The error could be from JWT verification or the DB check.
        // The controller will catch this and force a logout.
        console.error("Refresh token validation failed:", error.message);
        throw new Error("Invalid refresh token. Please log in again.");
    }
};

const verifyUser = async userId => {
    const user = await prisma.user.findUnique({
        where: { userId },
        select: {
            userId: true,
            fullName: true,
            isActive: true,
            profileImageUrl: true,
            deletedAt: true,
            role: {
                select: {
                    role: true
                }
            }
        }
    });

    if (!user) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USERS.PROFILE_NOT_FOUND
        };
    }

    if (!user.isActive || user.deletedAt) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE
        };
    }

    const { deletedAt: _, ...userProfile } = user;

    return {
        success: RESPONSE_FLAGS.SUCCESS,
        code: RESPONSE_CODES.SUCCESS,
        message: SUCCESS_MESSAGES.AUTH.PROFILE_FETCHED,
        data: userProfile
    };
};

const deactivateUser = async userId => {
    const user = await prisma.user.findUnique({
        where: { userId }
    });

    if (!user) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USERS.PROFILE_NOT_FOUND
        };
    }

    if (!user.isActive || user.deletedAt) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.AUTH.ACCOUNT_ALREADY_DEACTIVATED
        };
    }

    await prisma.user.update({
        where: { userId },
        data: {
            isActive: false,
            deletedAt: new Date()
        }
    });
};

/**
 * Re-activates a user account that was previously deactivated.
 * Sets isActive to true and deletedAt to null.
 * @param {string} userId - The ID of the user to reactivate.
 * @returns {object} A success message.
 */
const reactivateUserProfile = async userId => {
    // First, find the user to ensure they exist.
    const user = await prisma.user.findUnique({
        where: { userId }
    });

    if (!user) {
        throw {
            code: RESPONSE_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.USERS.PROFILE_NOT_FOUND
        };
    }

    // Check if the account is already active to prevent redundant updates.
    if (user.isActive && user.deletedAt === null) {
        throw {
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.AUTH.ACCOUNT_ALREADY_ACTIVE
        };
    }

    // Update the user record to reactivate the account.
    await prisma.user.update({
        where: { userId },
        data: {
            isActive: true,
            deletedAt: null, // This is crucial to "un-delete" the user.
            deactivationReason: null // Optional: Clear the reason for deactivation.
        }
    });
};

const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await prisma.user.findUnique({
        where: { userId },
        select: {
            password: true,
            isActive: true,
            deletedAt: true
        }
    });

    if (!user) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.UNAUTHORIZED,
            message: ERROR_MESSAGES.USERS.PROFILE_NOT_FOUND
        };
    }

    if (!user.isActive || user.deletedAt) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.BAD_REQUEST,
            message: ERROR_MESSAGES.AUTH.ACCOUNT_INACTIVE
        };
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.UNAUTHORIZED,
            message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
        };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { userId },
        data: {
            password: hashedPassword
        }
    });

    return {
        success: RESPONSE_FLAGS.SUCCESS,
        code: RESPONSE_CODES.SUCCESS,
        message: SUCCESS_MESSAGES.AUTH.PASSWORD_CHANGED
    };
};

module.exports = {
    login,
    register,
    refreshUserToken,
    verifyUser,
    deactivateUser,
    reactivateUserProfile,
    changePassword
};
