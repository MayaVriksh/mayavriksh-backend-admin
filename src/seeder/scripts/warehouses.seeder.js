const prisma = require("../../config/prisma.config");
const { ROLES } = require("../../constants/roles.constant");
const generateCustomId = require("../../utils/generateCustomId");
const warehouses = require("../data/warehouse.data");

async function seedWarehouses() {
    console.log("🏬 Seeding Warehouses...");

    try {
        await prisma.$transaction(async tx => {
            for (const warehouse of warehouses) {
                if (!warehouse.name) {
                    console.warn(
                        `⚠️  Skipping invalid warehouse data:`,
                        warehouse
                    );
                    continue;
                }

                const existingWarehouse = await tx.warehouse.findFirst({
                    where: { name: warehouse.name }
                });

                if (!existingWarehouse) {
                    const warehouseId = await generateCustomId(
                        tx,
                        ROLES.WAREHOUSE
                    );
                    await tx.warehouse.create({
                        data: { ...warehouse, warehouseId }
                    });

                    console.log(
                        `✅ Warehouse '${warehouse.name}' created → ID: ${warehouseId}`
                    );
                } else {
                    console.log(
                        `⚠️  Warehouse '${warehouse.name}' already exists`
                    );
                }
            }
        });

        console.log("🎉 Warehouse seeding completed.");
    } catch (error) {
        console.error("❌ Error while seeding warehouses:", error);
    }
}

if (require.main === module) {
    seedWarehouses()
        .catch(e => {
            console.error("❌ Seeding failed:", e.stack || e);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedWarehouses;
