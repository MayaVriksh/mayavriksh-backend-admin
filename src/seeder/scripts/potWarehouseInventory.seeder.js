const prisma = require("../../config/prisma.config");
const { v4: uuid } = require("uuid");

async function seedPotWarehouseInventory() {
    try {
        console.log(
            "🪴 Seeding PotWarehouseInventory for all variants and warehouses..."
        );

        const warehouses = await prisma.warehouse.findMany();
        const potVariants = await prisma.potVariants.findMany({
            include: { category: true }
        });

        if (!warehouses.length || !potVariants.length) {
            throw new Error("No warehouses or potVariants found.");
        }

        for (const warehouse of warehouses) {
            for (const variant of potVariants) {
                const existing = await prisma.potWarehouseInventory.findFirst({
                    where: {
                        potVariantId: variant.potVariantId,
                        warehouseId: warehouse.warehouseId
                    }
                });

                if (existing) {
                    console.log(
                        `⚠️ Skipping existing: ${variant.potVariantId} in ${warehouse.name}`
                    );
                    continue;
                }

                // Example realistic values
                const stockIn = 80;
                const stockOut = 15;
                const stockLossCount = 2;
                const reservedUnit = 4;
                const sellingPrice = 200.0;
                const profitMargin = 18;

                const trueCostPrice = +(
                    sellingPrice *
                    (1 - profitMargin / 100)
                ).toFixed(2);
                const totalCost = +(
                    trueCostPrice *
                    (stockIn - stockOut)
                ).toFixed(2);
                const currentStock = stockIn - stockOut - stockLossCount;

                await prisma.potWarehouseInventory.create({
                    data: {
                        id: uuid(),
                        potVariantId: variant.potVariantId,
                        potCategoryId: variant.categoryId,
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
                    `✅ Seeded: ${variant.potVariantId} → ${warehouse.name}`
                );
            }
        }

        console.log("🎉 PotWarehouseInventory seeding completed.");
    } catch (error) {
        console.error("❌ Error seeding PotWarehouseInventory:", error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedPotWarehouseInventory();
}

module.exports = seedPotWarehouseInventory;
