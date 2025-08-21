const { prisma } = require("../../../config/prisma.config");
const { supplierUsers } = require("../../data/users.data");
const { ROLES } = require("../../../constants/roles.constant");
const {
    hashPassword,
    findRoleId,
    generateCustomId
} = require("../../helpers/user.utils");

async function seedSupplierUsers() {
    console.log("🌱 Seeding Suppliers...");
    const roleId = await findRoleId(ROLES.SUPPLIER);

    for (const entry of supplierUsers) {
        await prisma.$transaction(async (tx) => {
            const userId = await generateCustomId(ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const supplierId = await generateCustomId(ROLES.SUPPLIER);
            await tx.supplier.create({
                data: {
                    supplierId,
                    userId: user.userId,
                    roleId,
                    nurseryName: entry.supplier.nurseryName
                }
            });

            console.log(`✅ Supplier ${user.email} created`);
        });
    }
}

if (require.main === module) {
    seedSupplierUsers()
        .catch((err) => {
            console.error("❌ Supplier seeding failed:", err);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedSupplierUsers;
