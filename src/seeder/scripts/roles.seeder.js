const { roles } = require("../data/roles.data");
const prisma = require("../../config/prisma.config");
const { ROLE } = require("../../constants/prefix.constant");
const generateCustomId = require("../../utils/generateCustomId");

async function seedRoles() {
    console.log("🌱 Seeding Roles...");

    for (const roleData of roles) {
        try {
            const existingRole = await prisma.role.findFirst({
                where: { role: roleData.role }
            });

            if (!existingRole) {
                const roleId = await generateCustomId(ROLE);
                await prisma.role.create({
                    data: {
                        roleId,
                        role: roleData.role,
                        addedByType: roleData.addedByType,
                        addedByUserId: roleData.addedByUserId
                    }
                });

                console.log(`✅ Role '${roleData.role}' created`);
            } else {
                console.log(`⚠️  Role '${roleData.role}' already exists`);
            }
        } catch (error) {
            console.error(
                `❌ Error with role '${roleData.role}':`,
                error.message
            );
        }
    }

    console.log("✅ Role seeding completed.");
}

if (require.main === module) {
    seedRoles()
        .catch(error => {
            console.error("❌ Seeding failed:", error);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedRoles;
