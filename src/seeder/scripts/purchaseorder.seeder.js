const prisma = require("../../config/prisma.config");
const generatePurchaseOrderData = require("../data/purchaseorder.data");

async function seedPurchaseOrders() {
    console.log("📦 Seeding Purchase Orders...");

    const plants = await prisma.plants.findMany();
    const variants = await prisma.plantVariants.findMany();
    const warehouses = await prisma.warehouse.findMany();
    const suppliers = await prisma.supplier.findMany();

    if (
        !plants.length ||
        !variants.length ||
        !warehouses.length ||
        !suppliers.length
    ) {
        throw new Error("❌ Required data missing in DB.");
    }

    const supplier = suppliers[0];
    const orders = generatePurchaseOrderData(
        plants,
        variants,
        warehouses,
        supplier
    );

    for (const order of orders) {
        try {
            await prisma.$transaction(
                async tx => {
                    await tx.purchaseOrder.create({
                        data: {
                            id: order.id,
                            warehouseId: order.warehouseId,
                            adminId: order.adminId,
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

                    // 2. Create PurchaseOrderItems with same `purchaseOrderId`
                    const itemsWithPOId = order.items.map(item => ({
                        ...item,
                        purchaseOrderId: order.id
                    }));

                    await tx.purchaseOrderItems.createMany({
                        data: itemsWithPOId,
                        skipDuplicates: true
                    });
                },
                {
                    maxWait: 25000,
                    timeout: 45000,
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
