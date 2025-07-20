const prisma = require("../../config/prisma.config");
const { v4: uuid } = require("uuid");

async function seedPlantWarehouseInventory() {
    try {
        console.log(
            "🌱 Seeding PlantWarehouseInventory for all variants and warehouses..."
        );

        const warehouses = await prisma.warehouse.findMany();
        const plantVariants = await prisma.plantVariants.findMany();

        if (!warehouses.length || !plantVariants.length) {
            throw new Error("No warehouses or plantVariants found.");
        }

        for (const warehouse of warehouses) {
            for (const variant of plantVariants) {
                const existing = await prisma.plantWarehouseInventory.findFirst(
                    {
                        where: {
                            variantId: variant.variantId,
                            warehouseId: warehouse.warehouseId
                        }
                    }
                );

                if (existing) {
                    console.log(
                        `⚠️ Skipping existing: ${variant.variantId} in ${warehouse.name}`
                    );
                    continue;
                }

                const stockIn = 100;
                const stockOut = 20;
                const stockLossCount = 3;
                const reservedUnit = 5;
                const sellingPrice = 300.0;
                const profitMargin = 20;

                const trueCostPrice = +(
                    sellingPrice *
                    (1 - profitMargin / 100)
                ).toFixed(2);
                const totalCost = +(
                    trueCostPrice *
                    (stockIn - stockOut)
                ).toFixed(2);
                const currentStock = stockIn - stockOut - stockLossCount;

                await prisma.plantWarehouseInventory.create({
                    data: {
                        id: uuid(),
                        plantId: variant.plantId,
                        variantId: variant.variantId,
                        warehouseId: warehouse.warehouseId,
                        stockIn,
                        stockOut,
                        stockLossCount,
                        latestQuantityAdded: stockIn,
                        currentStock,
                        reservedUnit,
                        sellingPrice,
                        profitMargin,
                        trueCostPrice,
                        totalCost,
                        lastRestocked: new Date()
                    }
                });

                console.log(
                    `✅ Seeded: ${variant.variantId} → ${warehouse.name}`
                );
            }
        }

        console.log("🎉 PlantWarehouseInventory seeding completed.");
    } catch (error) {
        console.error("❌ Error seeding PlantWarehouseInventory:", error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedPlantWarehouseInventory();
}

module.exports = seedPlantWarehouseInventory;
