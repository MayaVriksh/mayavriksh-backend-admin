const { v4: uuidv4 } = require("uuid");

function generatePurchaseOrderData(plants, variants, warehouses, supplier) {
    const data = [];

    for (let i = 0; i < 10; i++) {
        const poId = uuidv4();
        const warehouse = warehouses[i % warehouses.length];
        const deliveryCharge = 100 + i * 20;

        const items = [];

        for (let j = 0; j < 5; j++) {
            const plant = plants[j % plants.length];
            const variant = variants[j % variants.length];

            items.push({
                id: uuidv4(),
                purchaseOrderId: poId,
                productType: "Plant",
                plantId: plant.plantId,
                plantVariantId: variant.variantId,
                potCategoryId: null,
                potVariantId: null,
                unitsRequested: 5 + j,
                unitCostPrice: 80 + j * 5
            });
        }

        const totalCost =
            items.reduce(
                (sum, item) =>
                    sum + Number(item.unitCostPrice) * item.unitsRequested,
                0
            ) + deliveryCharge;

        data.push({
            id: poId,
            warehouseId: warehouse.warehouseId,
            supplierId: supplier.supplierId,
            deliveryCharges: deliveryCharge,
            totalCost,
            paymentPercentage: 30 + i * 5,
            status: "PENDING",
            isAccepted: false,
            invoiceUrl: null,
            expectedDateOfArrival: new Date(Date.now() + (i + 5) * 86400000),
            requestedAt: new Date(),
            acceptedAt: null,
            deliveredAt: null,
            supplierReviewNotes: null,
            warehouseManagerReviewNotes: null,
            items
        });
    }

    return data;
}

module.exports = generatePurchaseOrderData;
