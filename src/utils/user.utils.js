const bcrypt = require("bcrypt");
const { prisma } = require("../../config/prisma.config");
const generateCustomId = require("../../utils/generateCustomId");
const { ROLES } = require("../../constants/roles.constant");

const SALT_ROUNDS = 10;

async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

async function findRoleId(roleConstant) {
    const role = await prisma.role.findUnique({
        where: { role: roleConstant }
    });
    return role?.roleId;
}

module.exports = {
    hashPassword,
    findRoleId
};
