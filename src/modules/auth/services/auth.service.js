const prisma = require("../../../config/prisma.config");
const bcrypt = require("bcrypt");
const { generateToken } = require("../../../utils/jwt.util");
const generateCustomId = require("../../../utils/generateCustomId");

const { ROLES } = require("../../../constants/roles.constant");
const ERROR_MESSAGES = require("../../../constants/errorMessages.constant");
const {
    RESPONSE_FLAGS,
    RESPONSE_CODES
} = require("../../../constants/responseCodes.constant");
const SUCCESS_MESSAGES = require("../../../constants/successMessages.constant.js");

const register = async data => {
    const { firstName, lastName, email, password, role } = data;

    return await prisma.$transaction(async tx => {
        const existingUser = await tx.user.findUnique({ where: { email } });
        if (existingUser) {
            throw {
                success: RESPONSE_FLAGS.FAILURE,
                code: RESPONSE_CODES.BAD_REQUEST,
                message: ERROR_MESSAGES.AUTH.EMAIL_ALREADY_REGISTERED
            };
        }

        const roleRecord = await tx.role.findUnique({ where: { role } });
        if (!roleRecord) {
            throw {
                success: RESPONSE_FLAGS.FAILURE,
                code: RESPONSE_CODES.INTERNAL_SERVER_ERROR,
                message: ERROR_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
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
                    message: ERROR_MESSAGES.AUTH.INVALID_ROLE
                };
        }

        const createdUser = await tx.user.create({
            data: {
                userId,
                roleId: roleRecord.roleId,
                email,
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
            }
        }
    });

    if (!user) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.UNAUTHORIZED,
            message: ERROR_MESSAGES.AUTH.LOGIN_FAILED
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
            message: ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS
        };
    }

    const { password: _, deletedAt: __, ...userProfile } = user;

    const systemToken = generateToken({ userId: user.userId });

    return { userProfile, systemToken };
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

const deactivateProfile = async userId => {
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
    verifyUser,
    deactivateProfile,
    changePassword
};
