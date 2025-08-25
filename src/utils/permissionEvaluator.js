/**
 * Permission Evaluation Utility
 *
 * This module checks whether a user has access to perform a specific action
 * on a resource within a module. It supports multi-role and multi-group users.
 *
 * Priority Order:
 *   1. UserPermission (DENY > ALLOW)
 *   2. GroupPermissions (any group allows → allowed)
 *   3. RolePermissions  (any role allows  → allowed)
 *   4. Default: Deny
 *
 * Used for centralized permission logic in routes, services, or middleware.
 */

const { prisma } = require("../config/prisma.config");

// Get all groups of the user
async function getUserGroups(userId) {
    const groups = await prisma.userGroup.findMany({
        where: { userId },
        select: { groupId: true }
    });
    return groups.map((g) => g.groupId);
}

// Get all roles of the user
async function getUserRoleIds(userId) {
    const roles = await prisma.userRole.findMany({
        where: { userId },
        select: { roleId: true }
    });
    return roles.map((r) => r.roleId);
}

// Step 1: Check if user has an explicit permission
async function findUserPermission(userId, actionId, resourceId, moduleId) {
    return await prisma.userPermission.findFirst({
        where: {
            userId,
            permission: {
                actionId,
                resourceId,
                moduleId,
                deletedAt: null
            }
        },
        include: {
            permission: true
        }
    });
}

// Step 2: Group-level permission (multi-group support)
async function hasGroupPermissionMulti(
    groupIds,
    actionId,
    resourceId,
    moduleId
) {
    if (!groupIds.length) return false;

    const permission = await prisma.groupPermission.findFirst({
        where: {
            groupId: { in: groupIds },
            actionId,
            resourceId,
            moduleId,
            deletedAt: null
        }
    });

    return !!permission;
}

// Step 3: Role-level permission (multi-role support)
async function hasRolePermissionMulti(roleIds, actionId, resourceId, moduleId) {
    if (!roleIds.length) return false;

    const permission = await prisma.rolePermission.findFirst({
        where: {
            roleId: { in: roleIds },
            permission: {
                actionId,
                resourceId,
                moduleId,
                deletedAt: null
            }
        },
        include: {
            permission: true
        }
    });

    return !!permission;
}

// FINAL permission evaluator
async function hasPermission(userId, actionId, resourceId, moduleId) {
    // Step 1: User-level permission (explicit deny / allow)
    const userPermission = await findUserPermission(
        userId,
        actionId,
        resourceId,
        moduleId
    );
    if (userPermission?.allowed === false) return false;
    if (userPermission?.allowed === true) return true;

    // Step 2: Group-level permission (multi-group)
    const groupIds = await getUserGroups(userId);
    if (await hasGroupPermissionMulti(groupIds, actionId, resourceId, moduleId))
        return true;

    // Step 3: Role-level permission (multi-role)
    const roleIds = await getUserRoleIds(userId);
    if (await hasRolePermissionMulti(roleIds, actionId, resourceId, moduleId))
        return true;

    // Step 4: Default deny
    return false;
}

module.exports = {
    getUserGroups,
    getUserRoleIds,
    findUserPermission,
    hasGroupPermissionMulti,
    hasRolePermissionMulti,
    hasPermission
};
