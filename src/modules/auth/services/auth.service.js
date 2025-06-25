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

    const userId = await generateCustomId(ROLES.USER);
    const hashedPassword = await bcrypt.hash(password, 10);

    let roleEntityId;
    if (role === ROLES.CUSTOMER)
        roleEntityId = await generateCustomId(ROLES.CUSTOMER);
    if (role === ROLES.ADMIN)
        roleEntityId = await generateCustomId(ROLES.ADMIN);
    if (role === ROLES.SUPER_ADMIN)
        roleEntityId = await generateCustomId(ROLES.SUPER_ADMIN);
    if (role === ROLES.SUPPLIER)
        roleEntityId = await generateCustomId(ROLES.SUPPLIER);
    if ([ROLES.KEY_AREA_MANAGER, ROLES.EMPLOYEE].includes(role)) {
        roleEntityId = await generateCustomId(ROLES.EMPLOYEE);
    }

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
        const roleId = roleRecord.roleId;

        const user = await tx.user.create({
            data: {
                userId,
                roleId,
                email,
                password: hashedPassword,
                fullName: {
                    firstName,
                    lastName: lastName || ""
                }
            }
        });

        switch (role) {
            case ROLES.CUSTOMER:
                await tx.customer.create({
                    data: {
                        customerId: roleEntityId,
                        userId: user.userId
                    }
                });
                break;

            case ROLES.ADMIN:
                await tx.admin.create({
                    data: {
                        adminId: roleEntityId,
                        userId: user.userId
                    }
                });
                break;

            case ROLES.SUPER_ADMIN:
                await tx.superAdmin.create({
                    data: {
                        superAdminId: roleEntityId,
                        userId: user.userId
                    }
                });
                break;

            case ROLES.SUPPLIER:
                await tx.supplier.create({
                    data: {
                        supplierId: roleEntityId,
                        userId: user.userId
                    }
                });
                break;

            case ROLES.KEY_AREA_MANAGER:
            case ROLES.EMPLOYEE:
                await tx.employee.create({
                    data: {
                        employeeId: roleEntityId,
                        userId: user.userId
                    }
                });
                break;

            default:
                throw {
                    success: RESPONSE_FLAGS.FAILURE,
                    code: RESPONSE_CODES.BAD_REQUEST,
                    message: ERROR_MESSAGES.COMMON.ACTION_FAILED
                };
        }
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

    if (!user.isActive) {
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

    const tokenPayload = {
        fullName: user.fullName,
        profileImageUrl: user.profileImageUrl,
        role: user.role.role,
        isActive: user.isActive
    };
    const userToken = generateToken({ ...tokenPayload });
    const systemToken = generateToken({ userId: user.userId });

    return { userToken, systemToken };
};

const deactivateProfile = async userId => {
    const user = await prisma.user.findUnique({
        where: { userId }
    });

    if (!user) {
        throw {
            success: RESPONSE_FLAGS.FAILURE,
            code: RESPONSE_CODES.NOT_FOUND,
            message: ERROR_MESSAGES.AUTH.USER_NOT_FOUND
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

module.exports = { login, register, deactivateProfile, changePassword };
