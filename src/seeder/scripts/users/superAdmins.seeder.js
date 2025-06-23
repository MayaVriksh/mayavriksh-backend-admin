const prisma = require("../../../config/prisma.config");
const { superAdminUsers } = require("../../data/users.data");
const { ROLES } = require("../../../constants/roles.constant");
const {
    hashPassword,
    findRoleId,
    generateCustomId
} = require("../../helpers/user.utils");

async function seedSuperAdminUsers() {
    console.log("🌱 Seeding Super Admins...");
    const roleId = await findRoleId(ROLES.SUPER_ADMIN);

    for (const entry of superAdminUsers) {
        await prisma.$transaction(async tx => {
            const userId = await generateCustomId(ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const superAdminId = await generateCustomId(ROLES.SUPER_ADMIN);
            await tx.superAdmin.create({
                data: {
                    superAdminId,
                    userId: user.userId,
                    roleId
                }
            });

            console.log(`✅ Super Admin ${user.email} created`);
        });
    }
}

if (require.main === module) {
    seedSuperAdminUsers()
        .catch(err => {
            console.error("❌ Super Admin seeding failed:", err);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedSuperAdminUsers;
