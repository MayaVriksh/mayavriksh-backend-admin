const { ROLES } = require("../../constants/roles.constant");

const roles = [
    {
        role: ROLES.ADMIN,
        addedByType: ROLES.SYSTEM,
        addedByUserId: null
    },
    {
        role: ROLES.SUPER_ADMIN,
        addedByType: ROLES.SYSTEM,
        addedByUserId: null
    },
    {
        role: ROLES.CUSTOMER,
        addedByType: ROLES.SYSTEM,
        addedByUserId: null
    },
    {
        role: ROLES.SUPPLIER,
        addedByType: ROLES.SYSTEM,
        addedByUserId: null
    },
    {
        role: ROLES.KEY_AREA_MANAGER,
        addedByType: ROLES.SYSTEM,
        addedByUserId: null
    }
];

module.exports = { roles };
