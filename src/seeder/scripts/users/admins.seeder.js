const prisma = require("../../../config/prisma.config");
const { adminUsers } = require("../../data/users.data");
const { ROLES } = require("../../../constants/roles.constant");
const {
    hashPassword,
    findRoleId,
    generateCustomId
} = require("../../../utils/user.utils");

async function seedAdminUsers() {
    console.log("🌱 Seeding Admins...");
    const roleId = await findRoleId(ROLES.ADMIN);

    for (const entry of adminUsers) {
        await prisma.$transaction(async (tx) => {
            const userId = await generateCustomId(tx, ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const adminId = await generateCustomId(tx, ROLES.ADMIN);
            await tx.admin.create({
                data: {
                    adminId,
                    userId: user.userId,
                    roleId
                }
            });

            console.log(`✅ Admin ${user.email} created`);
        });
    }
}

if (require.main === module) {
    seedAdminUsers()
        .catch((err) => {
            console.error("❌ Admin seeding failed:", err);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedAdminUsers;
