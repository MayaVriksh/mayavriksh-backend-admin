const { v4: uuidv4 } = require("uuid");
const { PRODUCT_TYPES } = require("../../constants/general.constant");

function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function buildPayments(totalCost, paymentPercentage) {
    let paidAmount = (totalCost * paymentPercentage) / 100;
    let paymentCount =
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
            paymentMethod: getRandomElement(["CASH", "ONLINE", "UPI", "NEFT"]),
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

    return payments;
}

function generatePurchaseOrderData(
    productType,
    productList,
    variantList,
    warehouses,
    supplierId
) {
    const data = [];

    for (let i = 0; i < 10; i++) {
        const warehouse = warehouses[i % warehouses.length];
        const deliveryCharge =
            productType === PRODUCT_TYPES.PLANT ? 100 + i * 20 : 120 + i * 15;

        const items = [];

        for (let j = 0; j < 5; j++) {
            let item;
            if (productType === PRODUCT_TYPES.PLANT) {
                const plant = productList[j % productList.length];
                const variant = variantList[j % variantList.length];
                item = {
                    id: uuidv4(),
                    productType: PRODUCT_TYPES.PLANT,
                    plantId: plant.plantId,
                    plantVariantId: variant.variantId,
                    potCategoryId: null,
                    potVariantId: null,
                    unitsRequested: 5 + j,
                    unitCostPrice: 80 + j * 5
                };
            } else {
                const category = productList[j % productList.length];
                const variant = variantList[j % variantList.length];
                item = {
                    id: uuidv4(),
                    productType: PRODUCT_TYPES.POT,
                    plantId: null,
                    plantVariantId: null,
                    potCategoryId: category.categoryId,
                    potVariantId: variant.potVariantId,
                    unitsRequested: 3 + j,
                    unitCostPrice: 60 + j * 4
                };
            }
            item.totalCost = item.unitCostPrice * item.unitsRequested;
            item.isAccepted = Math.random() > 0.2;
            item.createdAt = new Date();
            item.updatedAt = new Date();

            items.push(item);
        }

        const totalItemCost = items
            .filter((item) => item.isAccepted)
            .reduce((sum, item) => sum + item.totalCost, 0);

        const totalCost = totalItemCost + deliveryCharge;

        let paymentPercentage = getRandomElement([25, 40, 50, 60, 75, 100]);
        let payments = buildPayments(totalCost, paymentPercentage);

        const isCompleted = Math.random() > 0.5;
        if (isCompleted) {
            paymentPercentage = 100;
            payments = [
                {
                    paymentId: uuidv4(),
                    paidBy: getRandomElement(["ADMIN", "SYSTEM"]),
                    amount: totalCost,
                    status: "PAID",
                    paymentMethod: getRandomElement([
                        "CASH",
                        "ONLINE",
                        "UPI",
                        "NEFT"
                    ]),
                    transactionId: `TXN-${uuidv4().slice(0, 8)}`,
                    remarks: "Full Payment",
                    receiptUrl: null,
                    requestedAt: new Date(),
                    paidAt: new Date()
                }
            ];
        }

        const totalPaid = payments
            .filter((p) => p.status === "PAID")
            .reduce((sum, p) => sum + p.amount, 0);

        const pendingAmount = totalCost - totalPaid;

        data.push({
            warehouseId: warehouse.warehouseId,
            supplierId,
            deliveryCharges: deliveryCharge,
            totalCost,
            pendingAmount,
            paymentPercentage,
            status: isCompleted ? "DELIVERED" : "PENDING",
            isAccepted: isCompleted || Math.random() > 0.3,
            invoiceUrl: null,
            expectedDateOfArrival: new Date(Date.now() + (i + 3) * 86400000),
            requestedAt: new Date(),
            acceptedAt: isCompleted
                ? new Date(Date.now() - 3 * 86400000)
                : null,
            deliveredAt: isCompleted ? new Date() : null,
            supplierReviewNotes: null,
            warehouseManagerReviewNotes: null,
            items,
            payments
        });
    }

    return data;
}

function generatePlantPurchaseOrderData(
    plants,
    variants,
    warehouses,
    supplierId
) {
    return generatePurchaseOrderData(
        PRODUCT_TYPES.PLANT,
        plants,
        variants,
        warehouses,
        supplierId
    );
}

function generatePotPurchaseOrderData(
    potCategories,
    potVariants,
    warehouses,
    supplierId
) {
    return generatePurchaseOrderData(
        PRODUCT_TYPES.POT,
        potCategories,
        potVariants,
        warehouses,
        supplierId
    );
}

module.exports = {
    generatePlantPurchaseOrderData,
    generatePotPurchaseOrderData
};
