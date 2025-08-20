const prisma = require("../../config/prisma.config");
const { ROLES } = require("../../constants/roles.constant");
const generateCustomId = require("../../utils/generateCustomId");
const warehouses = require("../data/warehouse.data");

async function seedWarehouses() {
    console.log("🏬 Seeding Warehouses for Mayavriksh...");

    try {
        await prisma.$transaction(
            async (tx) => {
                for (const warehouse of warehouses) {
                    if (!warehouse.name || !warehouse.officeAddress) {
                        console.warn(
                            "⚠️  Skipping invalid warehouse entry:",
                            warehouse
                        );
                        continue;
                    }

                    const existingWarehouse = await tx.warehouse.findFirst({
                        where: { name: warehouse.name }
                    });

                    if (existingWarehouse) {
                        console.log(
                            `⚠️  Warehouse '${warehouse.name}' already exists.`
                        );
                        continue;
                    }

                    const warehouseId = await generateCustomId(
                        tx,
                        ROLES.WAREHOUSE
                    );

                    await tx.warehouse.create({
                        data: {
                            ...warehouse,
                            warehouseId
                        }
                    });

                    console.log(
                        `✅ Created: '${warehouse.name}' → ID: ${warehouseId}`
                    );
                }
            },
            { maxWait: 20000, timeout: 25000 }
        );

        console.log("🎉 All Warehouses successfully seeded.");
    } catch (error) {
        console.error("❌ Error during warehouse seeding:", error);
    }
}

if (require.main === module) {
    seedWarehouses()
        .catch((error) => {
            console.error("❌ Seeding failed:", error.stack || error);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedWarehouses;
