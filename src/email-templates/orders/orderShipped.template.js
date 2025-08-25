const header = require("../common/header.template");
const footer = require("../common/footer.template");
const styles = require("../common/styles.template");

module.exports = function orderShippedTemplate({ name, orderId, trackingLink }) {
  return `
  <!doctype html>
  <html>
    <head>
      <title>Order Shipped - MAYAVRIKSH</title>
      ${styles()}
    </head>
    <body>
      <div class="wrapper">
        <div class="container">
          ${header()}
          <div class="body">
            <h2>Your Order is on the Way!</h2>
            <p>Hi ${name},</p>
            <p>Your order <strong>#${orderId}</strong> has been shipped.</p>
            <p>Track your shipment here: <a href="${trackingLink}">${trackingLink}</a></p>
            <p class="closing">Happy shopping!<br /><strong>Team MAYAVRIKSH</strong></p>
          </div>
          ${footer()}
        </div>
      </div>
    </body>
  </html>
  `;
};
