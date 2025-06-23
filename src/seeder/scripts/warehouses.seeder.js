const prisma = require("../../config/prisma.config");
const { ROLES } = require("../../constants/roles.constant");
const generateCustomId = require("../../utils/generateCustomId");
const warehouses = require("../data/warehouse.data");

async function seedWarehouses() {
    console.log("🏬 Seeding Warehouses...");

    for (const warehouse of warehouses) {
        try {
            const existingWarehouse = await prisma.warehouse.findFirst({
                where: { name: warehouse.name }
            });

            if (!existingWarehouse) {
                const warehouseId = await generateCustomId(ROLES.WAREHOUSE);
                await prisma.warehouse.create({
                    data: { ...warehouse, warehouseId }
                });

                console.log(
                    `✅ Warehouse '${warehouse.name}' created → ID: ${warehouseId}`
                );
            } else {
                console.log(`⚠️  Warehouse '${warehouse.name}' already exists`);
            }
        } catch (error) {
            console.error(
                `❌ Error with warehouse '${warehouse.name || "Unnamed"}':`,
                error.message
            );
        }
    }

    console.log("🎉 Warehouse seeding completed.");
}

if (require.main === module) {
    seedWarehouses()
        .catch(e => {
            console.error("❌ Seeding failed:", e);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedWarehouses;
