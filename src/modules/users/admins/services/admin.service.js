const util = require("util");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../../../../config/prisma.config.js");
const {
    RESPONSE_CODES,
    RESPONSE_FLAGS
} = require("../../../../constants/responseCodes.constant");
const ERROR_MESSAGES = require("../../../../constants/errorMessages.constant");
const SUCCESS_MESSAGES = require("../../../../constants/successMessages.constant.js");
const ORDER_STATUSES = require("../../../../constants/orderStatus.constant.js");
const ROLES = require("../../../../constants/roles.constant.js");

const showAdminProfile = async userId => {
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

module.exports = {
    showAdminProfile,
};