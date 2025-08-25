const { prisma } = require("../../../config/prisma.config");
const { keyAreaManagerUsers } = require("../../data/users.data");
const { ROLES, DEPARTMENTS } = require("../../../constants/roles.constant");
const {
    hashPassword,
    findRoleId,
    generateCustomId
} = require("../../helpers/user.utils");

async function seedKeyAreaManagerUsers() {
    console.log("🌱 Seeding Key Area Managers...");
    const roleId = await findRoleId(ROLES.KEY_AREA_MANAGER);

    for (const entry of keyAreaManagerUsers) {
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

            const employeeId = await generateCustomId(tx, ROLES.EMPLOYEE);
            await tx.employee.create({
                data: {
                    employeeId,
                    userId: user.userId,
                    roleId,
                    designation: ROLES.KEY_AREA_MANAGER,
                    department: DEPARTMENTS[ROLES.KEY_AREA_MANAGER]
                }
            });

            console.log(`✅ Key Area Manager ${user.email} seeded`);
        });
    }
}

if (require.main === module) {
    seedKeyAreaManagerUsers()
        .catch((err) => {
            console.error("❌ Key Area Manager seeding failed:", err);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedKeyAreaManagerUsers;
