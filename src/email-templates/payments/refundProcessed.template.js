const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function refundProcessedTemplate({ recipientName, amount, transactionId, refundId, dateTime }) {
  return `
  <!doctype html>
  <html>
    <head>
      <title>Refund Processed - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Refund Processed</h2>
            <p>Hello ${recipientName},</p>
            <p>Your refund has been successfully processed.</p>
            <div class="details">
              <p><strong>Refund Amount:</strong> ₹${amount}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Refund ID:</strong> ${refundId}</p>
              <p><strong>Date & Time:</strong> ${dateTime}</p>
            </div>
            <p>The refund may take 5–7 business days to reflect in your account depending on your bank or payment provider.</p>
            <p class="closing">If you need help, contact us at <a href="mailto:support@mayavriksh.com">support@mayavriksh.com</a>.<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
