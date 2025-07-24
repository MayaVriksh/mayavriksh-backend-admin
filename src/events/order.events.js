const EventEmitter = require("events");
const prisma = require("../config/prisma.config"); // Adjust path as needed
const { sendEmail } = require("../utils/email.util");

class OrderEventEmitter extends EventEmitter {}
const orderEvents = new OrderEventEmitter();

// --- Listen for the 'order.reviewed' event ---
orderEvents.on("order.reviewed", async ({ orderId, newTotalCost }) => {
    try {
        console.log(
            `Event 'order.reviewed' triggered for Order ID: ${orderId}`
        );

        // 1. Fetch the necessary data for the email
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id: orderId },
            select: {
                // Get the Warehouse to find the manager's email
                warehouse: {
                    select: {
                        name: true,
                        officeEmail: true // Assuming the warehouse has a contact email
                    }
                },
                // Get the Supplier to include their name
                supplier: {
                    select: {
                        nurseryName: true
                    }
                }
            }
        });

        if (!purchaseOrder || !purchaseOrder.warehouse?.officeEmail) {
            console.error(
                `Could not send notification for order ${orderId}: Missing warehouse or email.`
            );
            return;
        }

        // 2. Construct the email content
        const recipientEmail = purchaseOrder.warehouse.officeEmail;
        const subject = `Action Required: Purchase Order #${orderId} has been reviewed`;
        const htmlBody = `
            <h1>Purchase Order Reviewed</h1>
            <p>Hello ${purchaseOrder.warehouse.name} team,</p>
            <p>The supplier, <strong>${purchaseOrder.supplier.nurseryName}</strong>, has reviewed Purchase Order <strong>#${orderId}</strong>.</p>
            <p>The new adjusted total cost is <strong>₹${newTotalCost.toLocaleString()}</strong>.</p>
            <p>The order is now awaiting payment. Please log in to your dashboard to proceed.</p>
            <br/>
            <p>Thank you,</p>
            <p>The Maya Vriksh Team</p>
        `;

        // 3. Send the email
        await sendEmail({
            to: recipientEmail,
            subject: subject,
            html: htmlBody
        });
    } catch (error) {
        console.error(
            `Failed to process 'order.reviewed' event for order ${orderId}:`,
            error
        );
    }
});

module.exports = orderEvents;
