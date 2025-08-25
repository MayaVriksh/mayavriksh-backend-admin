module.exports = function headerTemplate() {
    return `
      <div class="header">
        <table>
          <tr>
            <td align="left">
              <img
                src="../../../public/assets/images/mv_logo.png"
                alt="MAYAVRIKSH Logo"
                style="max-height: 50px; display: block;"
              />
            </td>
            <td align="right">
              <h1 style="margin:0; font-size:22px; color:#ffffff; font-weight:bold;">MAYAVRIKSH</h1>
              <p style="margin:2px 0 0; font-size:13px; color:#d4e8d4; letter-spacing:0.5px;">From Soil to Soul</p>
            </td>
          </tr>
        </table>
      </div>
    `;
};
