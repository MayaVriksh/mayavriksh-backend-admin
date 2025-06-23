const testRoute = require("./test.route");
const authRoutes = require("../modules/auth/routes/auth.route");
const supplierRoutes = require("../modules/users/suppliers/routes/index.route");

module.exports = {
    name: "base-router-v1",
    register: async (server, _) => {
        server.route([...testRoute, ...authRoutes, ...supplierRoutes]);
    }
};
