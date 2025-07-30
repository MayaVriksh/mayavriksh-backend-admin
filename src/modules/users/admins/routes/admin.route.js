const {
    handleValidationFailure
} = require("../../../../utils/failActionValidation");

const AdminController = require("../controllers/admin.controller");
const AdminValidator = require("../validations/admin.validations");
const {
    verifyAccessTokenMiddleware,
    requireRole
} = require("../../../../middlewares/authenticate.middleware");
const { ROLES } = require("../../../../constants/roles.constant");

module.exports = [

{
        method: "GET",
        path: "/admin/my-profile",
        options: {
            tags: ["api", "Admin Profile"],
            pre: [verifyAccessTokenMiddleware, requireRole(ROLES.ADMIN)],
            handler: AdminController.showAdminProfile,
            description: "Get supplier profile details"
        }
    },
]