const prisma = require("../../../config/prisma.config");
const {
    adminUsers,
    superAdminUsers,
    customerUsers,
    supplierUsers,
    keyAreaManagerUsers
} = require("../../data/users.data");
const { ROLES, DEPARTMENTS } = require("../../../constants/roles.constant");
const generateCustomId = require("../../../utils/generateCustomId");
const bcrypt = require("bcrypt");

const SALT_ROUNDS = 10;

async function hashPassword(password) {
    return await bcrypt.hash(password, SALT_ROUNDS);
}

async function findRoleId(roleConstant) {
    const role = await prisma.role.findUnique({
        where: { role: roleConstant }
    });
    return role?.roleId;
}

async function userExists(email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    return Boolean(existing);
}

async function seedAdminUsers() {
    const roleId = await findRoleId(ROLES.ADMIN);
    console.log(`🌱 Seeding Admins`);

    for (const entry of adminUsers) {
        if (await userExists(entry.user.email)) {
            console.log(`⚠️  Admin '${entry.user.email}' already exists`);
            continue;
        }

        await prisma.$transaction(async tx => {
            const userId = await generateCustomId(ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    roleId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const adminId = await generateCustomId(ROLES.ADMIN);
            await tx.admin.create({
                data: {
                    adminId,
                    userId: user.userId
                }
            });

            console.log(`✅ Admin '${user.email}' created`);
        });
    }
}

async function seedSuperAdminUsers() {
    const roleId = await findRoleId(ROLES.SUPER_ADMIN);
    console.log(`🌱 Seeding Super Admins`);

    for (const entry of superAdminUsers) {
        if (await userExists(entry.user.email)) {
            console.log(`⚠️  Super Admin '${entry.user.email}' already exists`);
            continue;
        }

        await prisma.$transaction(async tx => {
            const userId = await generateCustomId(ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    roleId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const superAdminId = await generateCustomId(ROLES.SUPER_ADMIN);
            await tx.superAdmin.create({
                data: {
                    superAdminId,
                    userId: user.userId
                }
            });

            console.log(`✅ Super Admin '${user.email}' created`);
        });
    }
}

async function seedCustomerUsers() {
    const roleId = await findRoleId(ROLES.CUSTOMER);
    console.log(`🌱 Seeding Customers`);

    for (const entry of customerUsers) {
        if (await userExists(entry.user.email)) {
            console.log(`⚠️  Customer '${entry.user.email}' already exists`);
            continue;
        }

        await prisma.$transaction(async tx => {
            const userId = await generateCustomId(ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    roleId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const customerId = await generateCustomId(ROLES.CUSTOMER);
            await tx.customer.create({
                data: {
                    customerId,
                    userId: user.userId
                }
            });

            console.log(`✅ Customer '${user.email}' created`);
        });
    }
}

async function seedSupplierUsers() {
    const roleId = await findRoleId(ROLES.SUPPLIER);
    const warehouses = await prisma.warehouse.findMany();

    if (warehouses.length === 0) {
        throw new Error(
            "❌ No warehouses found. Please seed warehouses first."
        );
    }

    console.log(`🌱 Seeding Suppliers`);

    for (let i = 0; i < supplierUsers.length; i++) {
        const entry = supplierUsers[i];

        if (await userExists(entry.user.email)) {
            console.log(`⚠️  Supplier '${entry.user.email}' already exists`);
            continue;
        }

        const warehouse = warehouses[i % warehouses.length];

        await prisma.$transaction(async tx => {
            const userId = await generateCustomId(ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    roleId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const supplierId = await generateCustomId(ROLES.SUPPLIER);
            await tx.supplier.create({
                data: {
                    supplierId,
                    userId: user.userId,
                    nurseryName: entry.supplier.nurseryName
                }
            });

            console.log(
                `✅ Supplier '${user.email}' created and linked to warehouse '${warehouse.name}'`
            );
        });
    }
}

async function seedKeyAreaManagerUsers() {
    const roleId = await findRoleId(ROLES.KEY_AREA_MANAGER);
    console.log(`🌱 Seeding Key Area Managers`);

    for (const entry of keyAreaManagerUsers) {
        if (await userExists(entry.user.email)) {
            console.log(
                `⚠️  Key Area Manager '${entry.user.email}' already exists`
            );
            continue;
        }

        await prisma.$transaction(async tx => {
            const userId = await generateCustomId(ROLES.USER);
            const hashedPassword = await hashPassword(entry.user.password);

            const user = await tx.user.create({
                data: {
                    userId,
                    roleId,
                    ...entry.user,
                    password: hashedPassword
                }
            });

            const employeeId = await generateCustomId(ROLES.EMPLOYEE);
            await tx.employee.create({
                data: {
                    employeeId,
                    userId: user.userId,
                    designation: ROLES.KEY_AREA_MANAGER,
                    department: DEPARTMENTS[ROLES.KEY_AREA_MANAGER]
                }
            });

            console.log(
                `✅ Key Area Manager '${user.email}' created and linked to Employee`
            );
        });
    }
}

async function seedAllUsers() {
    console.log("🌱 Seeding users...");

    await seedAdminUsers();
    await seedSuperAdminUsers();
    await seedCustomerUsers();
    await seedSupplierUsers();
    await seedKeyAreaManagerUsers();

    console.log("✅ All users seeded successfully.");
}

if (require.main === module) {
    seedAllUsers()
        .catch(error => {
            console.error("❌ Seeder Error:", error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedAllUsers;
