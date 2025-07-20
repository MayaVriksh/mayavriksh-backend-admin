const prisma = require("../../config/prisma.config");
const {
    generatePlantPurchaseOrderData,
    generatePotPurchaseOrderData
} = require("../data/purchaseorder.data");
const generateCustomId = require("../../utils/generateCustomId");

async function seedPurchaseOrders() {
    console.log("📦 Seeding Purchase Orders...");

    const plants = await prisma.plants.findMany();
    const plantVariants = await prisma.plantVariants.findMany();
    const potCategories = await prisma.potCategory.findMany();
    const potVariants = await prisma.potVariants.findMany();
    const warehouses = await prisma.warehouse.findMany();
    const suppliers = await prisma.supplier.findMany();

    if (
        !plants.length ||
        !plantVariants.length ||
        !potCategories.length ||
        !potVariants.length ||
        !warehouses.length ||
        !suppliers.length
    ) {
        throw new Error("❌ Required data missing in DB.");
    }

    const supplier = suppliers[0];

    const plantOrders = generatePlantPurchaseOrderData(
        plants,
        plantVariants,
        warehouses,
        supplier
    );

    const potOrders = generatePotPurchaseOrderData(
        potCategories,
        potVariants,
        warehouses,
        supplier
    );

    const allOrders = [...plantOrders, ...potOrders];

    for (const order of allOrders) {
        try {
            await prisma.$transaction(
                async tx => {
                    const purchaseOrderId = await generateCustomId(
                        tx,
                        "PURCHASE_ORDER"
                    );
                    await tx.purchaseOrder.create({
                        data: {
                            id: purchaseOrderId,
                            warehouseId: order.warehouseId,
                            supplierId: order.supplierId,
                            deliveryCharges: order.deliveryCharges,
                            totalCost: order.totalCost,
                            paymentPercentage: order.paymentPercentage,
                            status: order.status,
                            isAccepted: order.isAccepted,
                            invoiceUrl: order.invoiceUrl,
                            expectedDateOfArrival: order.expectedDateOfArrival,
                            requestedAt: order.requestedAt,
                            acceptedAt: order.acceptedAt,
                            deliveredAt: order.deliveredAt,
                            supplierReviewNotes: order.supplierReviewNotes,
                            warehouseManagerReviewNotes:
                                order.warehouseManagerReviewNotes
                        }
                    });

                    await tx.purchaseOrderItems.createMany({
                        data: order.items.map(item => ({
                            ...item,
                            purchaseOrderId
                        })),
                        skipDuplicates: true
                    });

                    for (const payment of order.payments) {
                        await tx.purchaseOrderPayment.create({
                            data: {
                                ...payment,
                                orderId: purchaseOrderId
                            }
                        });
                    }
                },
                {
                    maxWait: 99000,
                    timeout: 100000,
                    isolationLevel: "ReadCommitted"
                }
            );

            console.log(`✅ Seeded Purchase Order ${order.id}`);
        } catch (err) {
            console.error(`❌ Error seeding order ${order.id}:`, err.message);
        }
    }

    console.log("✅ All purchase orders seeded.");
}

if (require.main === module) {
    seedPurchaseOrders()
        .catch(err => {
            console.error("❌ Seeder failed:", err);
        })
        .finally(() => {
            prisma.$disconnect();
        });
}

module.exports = seedPurchaseOrders;
