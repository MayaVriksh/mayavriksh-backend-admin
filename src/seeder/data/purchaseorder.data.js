const { v4: uuidv4 } = require("uuid");
const { PRODUCT_TYPES } = require("../../constants/general.constant");

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generatePlantPurchaseOrderData(
    plants,
    variants,
    warehouses,
    supplier
) {
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
                productType: PRODUCT_TYPES.PLANT,
                plantId: plant.plantId,
                plantVariantId: variant.variantId,
                potCategoryId: null,
                potVariantId: null,
                unitsRequested: 5 + j,
                unitCostPrice: 80 + j * 5
            });
        }

        const totalItemCost = items.reduce(
            (sum, item) =>
                sum + Number(item.unitCostPrice) * item.unitsRequested,
            0
        );
        const totalCost = totalItemCost + deliveryCharge;

        const paymentPercentages = [30, 50, 75, 100];
        const paymentPercentage = getRandomElement(paymentPercentages);
        const paidAmount = (totalCost * paymentPercentage) / 100;

        const paymentCount =
            paymentPercentage === 100 ? 1 : Math.floor(Math.random() * 3) + 1;
        const payments = [];
        let remaining = paidAmount;

        for (let p = 0; p < paymentCount; p++) {
            const isLast = p === paymentCount - 1;
            const amount = isLast
                ? remaining
                : parseFloat((Math.random() * (remaining / 2)).toFixed(2));

            payments.push({
                paymentId: uuidv4(),
                paidBy: getRandomElement(["ADMIN", "SYSTEM"]),
                amount,
                status: getRandomElement(["PENDING", "PAID"]),
                paymentMethod: getRandomElement([
                    "CASH",
                    "ONLINE",
                    "UPI",
                    "NEFT"
                ]),
                transactionId:
                    Math.random() > 0.5 ? `TXN-${uuidv4().slice(0, 8)}` : null,
                remarks:
                    paymentCount === 1
                        ? "Full Payment"
                        : p === 0
                          ? "Initial Payment"
                          : `Installment ${p + 1}`,
                receiptUrl: null,
                requestedAt: new Date(),
                paidAt: Math.random() > 0.5 ? new Date() : null
            });

            remaining -= amount;
        }

        data.push({
            id: poId,
            warehouseId: warehouse.warehouseId,
            supplierId: supplier.supplierId,
            deliveryCharges: deliveryCharge,
            totalCost,
            paymentPercentage,
            status: "PENDING",
            isAccepted: false,
            invoiceUrl: null,
            expectedDateOfArrival: new Date(Date.now() + (i + 5) * 86400000),
            requestedAt: new Date(),
            acceptedAt: null,
            deliveredAt: null,
            supplierReviewNotes: null,
            warehouseManagerReviewNotes: null,
            items,
            payments
        });
    }

    return data;
}

function generatePotPurchaseOrderData(
    potCategories,
    potVariants,
    warehouses,
    supplier
) {
    const data = [];

    for (let i = 0; i < 10; i++) {
        const poId = uuidv4();
        const warehouse = warehouses[i % warehouses.length];
        const deliveryCharge = 120 + i * 15;

        const items = [];

        for (let j = 0; j < 5; j++) {
            const category = potCategories[j % potCategories.length];
            const variant = potVariants[j % potVariants.length];

            items.push({
                id: uuidv4(),
                productType: PRODUCT_TYPES.POT,
                plantId: null,
                plantVariantId: null,
                potCategoryId: category.categoryId,
                potVariantId: variant.potVariantId,
                unitsRequested: 3 + j,
                unitCostPrice: 60 + j * 4
            });
        }

        const totalItemCost = items.reduce(
            (sum, item) =>
                sum + Number(item.unitCostPrice) * item.unitsRequested,
            0
        );
        const totalCost = totalItemCost + deliveryCharge;

        const paymentPercentages = [25, 40, 60, 100];
        const paymentPercentage = getRandomElement(paymentPercentages);
        const paidAmount = (totalCost * paymentPercentage) / 100;

        const paymentCount =
            paymentPercentage === 100 ? 1 : Math.floor(Math.random() * 3) + 1;
        const payments = [];
        let remaining = paidAmount;

        for (let p = 0; p < paymentCount; p++) {
            const isLast = p === paymentCount - 1;
            const amount = isLast
                ? remaining
                : parseFloat((Math.random() * (remaining / 2)).toFixed(2));

            payments.push({
                paymentId: uuidv4(),
                paidBy: getRandomElement(["ADMIN", "SYSTEM"]),
                amount,
                status: getRandomElement(["PENDING", "PAID"]),
                paymentMethod: getRandomElement([
                    "CASH",
                    "ONLINE",
                    "UPI",
                    "NEFT"
                ]),
                transactionId:
                    Math.random() > 0.5 ? `TXN-${uuidv4().slice(0, 8)}` : null,
                remarks:
                    paymentCount === 1
                        ? "Full Payment"
                        : p === 0
                          ? "Initial Payment"
                          : `Installment ${p + 1}`,
                receiptUrl: null,
                requestedAt: new Date(),
                paidAt: Math.random() > 0.5 ? new Date() : null
            });

            remaining -= amount;
        }

        data.push({
            id: poId,
            warehouseId: warehouse.warehouseId,
            supplierId: supplier.supplierId,
            deliveryCharges: deliveryCharge,
            totalCost,
            paymentPercentage,
            status: "PENDING",
            isAccepted: false,
            invoiceUrl: null,
            expectedDateOfArrival: new Date(Date.now() + (i + 3) * 86400000),
            requestedAt: new Date(),
            acceptedAt: null,
            deliveredAt: null,
            supplierReviewNotes: null,
            warehouseManagerReviewNotes: null,
            items,
            payments
        });
    }

    return data;
}

module.exports = {
    generatePlantPurchaseOrderData,
    generatePotPurchaseOrderData
};
