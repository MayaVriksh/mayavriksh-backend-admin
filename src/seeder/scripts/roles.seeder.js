const { roles } = require("../data/roles.data");
const { prisma } = require("../../config/prisma.config");
const { ROLE } = require("../../constants/prefix.constant");
const generateCustomId = require("../../utils/generateCustomId");

async function seedRoles() {
    console.log("🌱 Seeding Roles...");

    try {
        await prisma.$transaction(
            async (tx) => {
                for (const roleData of roles) {
                    if (!roleData.role) {
                        console.warn(
                            `⚠️  Skipping invalid role data:`,
                            roleData
                        );
                        continue;
                    }

                    const existingRole = await tx.role.findFirst({
                        where: { role: roleData.role }
                    });

                    if (!existingRole) {
                        const roleId = await generateCustomId(tx, ROLE);
                        await tx.role.create({
                            data: {
                                roleId,
                                role: roleData.role,
                                addedByType: roleData.addedByType,
                                addedByUserId: roleData.addedByUserId
                            }
                        });
                        console.log(`✅ Role '${roleData.role}' created`);
                    } else {
                        console.log(
                            `⚠️  Role '${roleData.role}' already exists`
                        );
                    }
                }
            },
            { maxWait: 20000, timeout: 20000 }
        );

        console.log("✅ Role seeding completed.");
    } catch (error) {
        console.error("❌ Error during role seeding:", error);
    }
}

if (require.main === module) {
    seedRoles()
        .catch((error) => {
            console.error("❌ Seeding failed:", error);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedRoles;
