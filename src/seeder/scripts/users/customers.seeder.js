const prisma = require("../../../config/prisma.config");
const { customerUsers } = require("../../data/users.data");
const { ROLES } = require("../../../constants/roles.constant");
const {
    hashPassword,
    findRoleId,
    generateCustomId
} = require("../../helpers/user.utils");

async function seedCustomerUsers() {
    console.log("🌱 Seeding Customers...");
    const roleId = await findRoleId(ROLES.CUSTOMER);

    for (const entry of customerUsers) {
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

            const customerId = await generateCustomId(ROLES.CUSTOMER);
            await tx.customer.create({
                data: {
                    customerId,
                    userId: user.userId,
                    roleId
                }
            });

            console.log(`✅ Customer ${user.email} created`);
        });
    }
}

if (require.main === module) {
    seedCustomerUsers()
        .catch(err => {
            console.error("❌ Customer seeding failed:", err);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedCustomerUsers;
