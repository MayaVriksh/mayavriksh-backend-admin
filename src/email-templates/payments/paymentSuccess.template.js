const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function paymentSuccessTemplate({ recipientName, amount, transactionId, dateTime }) {
  return `
  <!doctype html>
  <html>
    <head>
      <title>Payment Successful - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Payment Successful</h2>
            <p>Hi ${recipientName},</p>
            <p>Your payment has been processed successfully.</p>
            <div class="details">
              <p><strong>Amount:</strong> ₹${amount}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Date & Time:</strong> ${dateTime}</p>
            </div>
            <p>If you have any questions, reach us at <a href="mailto:support@mayavriksh.com">support@mayavriksh.com</a>.</p>
            <p class="closing">Thank you for choosing us!<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
