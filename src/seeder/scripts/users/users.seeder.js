const { prisma } = require("../../../config/prisma.config");
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
    if (!email) return false;
    const existing = await prisma.user.findUnique({ where: { email } });
    return Boolean(existing);
}

async function seedAdminUsers() {
    const roleId = await findRoleId(ROLES.ADMIN);
    console.log(`🌱 Seeding Admins`);

    await prisma.$transaction(
        async (tx) => {
            for (const entry of adminUsers) {
                if (
                    !entry?.user?.email ||
                    (await userExists(entry.user.email))
                ) {
                    console.log(
                        `⚠️  Admin '${entry.user?.email}' already exists or invalid`
                    );
                    continue;
                }

                const userId = await generateCustomId(tx, ROLES.USER);
                const hashedPassword = await hashPassword(entry.user.password);

                const user = await tx.user.create({
                    data: {
                        userId,
                        roleId,
                        ...entry.user,
                        password: hashedPassword,
                        profileImageUrl:
                            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif"
                    }
                });

                const adminId = await generateCustomId(tx, ROLES.ADMIN);
                await tx.admin.create({
                    data: {
                        adminId,
                        userId: user.userId
                    }
                });

                console.log(`✅ Admin '${user.email}' created`);
            }
        },
        {
            // maxWait: 10000,
            timeout: 15000
        }
    );
}

async function seedSuperAdminUsers() {
    const roleId = await findRoleId(ROLES.SUPER_ADMIN);
    console.log(`🌱 Seeding Super Admins`);

    await prisma.$transaction(
        async (tx) => {
            for (const entry of superAdminUsers) {
                if (
                    !entry?.user?.email ||
                    (await userExists(entry.user.email))
                ) {
                    console.log(
                        `⚠️  Super Admin '${entry.user?.email}' already exists or invalid`
                    );
                    continue;
                }

                const userId = await generateCustomId(tx, ROLES.USER);
                const hashedPassword = await hashPassword(entry.user.password);

                const user = await tx.user.create({
                    data: {
                        userId,
                        roleId,
                        ...entry.user,
                        password: hashedPassword,
                        profileImageUrl:
                            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif"
                    }
                });

                const superAdminId = await generateCustomId(
                    tx,
                    ROLES.SUPER_ADMIN
                );
                await tx.superAdmin.create({
                    data: {
                        superAdminId,
                        userId: user.userId
                    }
                });

                console.log(`✅ Super Admin '${user.email}' created`);
            }
        },
        {
            // maxWait: 10000,
            timeout: 15000
        }
    );
}

async function seedCustomerUsers() {
    const roleId = await findRoleId(ROLES.CUSTOMER);
    console.log(`🌱 Seeding Customers`);

    await prisma.$transaction(
        async (tx) => {
            for (const entry of customerUsers) {
                if (
                    !entry?.user?.email ||
                    (await userExists(entry.user.email))
                ) {
                    console.log(
                        `⚠️  Customer '${entry.user?.email}' already exists or invalid`
                    );
                    continue;
                }

                const userId = await generateCustomId(tx, ROLES.USER);
                const hashedPassword = await hashPassword(entry.user.password);

                const user = await tx.user.create({
                    data: {
                        userId,
                        roleId,
                        ...entry.user,
                        password: hashedPassword,
                        profileImageUrl:
                            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif"
                    }
                });

                const customerId = await generateCustomId(tx, ROLES.CUSTOMER);
                await tx.customer.create({
                    data: {
                        customerId,
                        userId: user.userId
                    }
                });

                console.log(`✅ Customer '${user.email}' created`);
            }
        },
        {
            // maxWait: 10000,
            timeout: 15000
        }
    );
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

    await prisma.$transaction(
        async (tx) => {
            for (let i = 0; i < supplierUsers.length; i++) {
                const entry = supplierUsers[i];

                if (
                    !entry?.user?.email ||
                    (await userExists(entry.user.email))
                ) {
                    console.log(
                        `⚠️  Supplier '${entry.user?.email}' already exists or invalid`
                    );
                    continue;
                }

                const warehouse = warehouses[i % warehouses.length];

                const userId = await generateCustomId(tx, ROLES.USER);
                const hashedPassword = await hashPassword(entry.user.password);

                const user = await tx.user.create({
                    data: {
                        userId,
                        roleId,
                        ...entry.user,
                        profileImageUrl:
                            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif",
                        password: hashedPassword
                    }
                });

                const supplierId = await generateCustomId(tx, ROLES.SUPPLIER);
                await tx.supplier.create({
                    data: {
                        supplierId,
                        userId: user.userId,
                        warehouseId: warehouse.warehouseId,
                        nurseryName: entry.supplier.nurseryName,
                        businessCategory: entry.supplier.businessCategory,
                        gstin: entry.supplier.gstin,
                        tradeLicenseUrl:
                            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif"
                    }
                });

                console.log(
                    `✅ Supplier '${user.email}' created and linked to warehouse '${warehouse.name}'`
                );
            }
        },
        {
            // maxWait: 10000,
            timeout: 15000
        }
    );
}

async function seedKeyAreaManagerUsers() {
    const roleId = await findRoleId(ROLES.KEY_AREA_MANAGER);
    console.log(`🌱 Seeding Key Area Managers`);

    await prisma.$transaction(
        async (tx) => {
            for (const entry of keyAreaManagerUsers) {
                if (
                    !entry?.user?.email ||
                    (await userExists(entry.user.email))
                ) {
                    console.log(
                        `⚠️  Key Area Manager '${entry.user?.email}' already exists or invalid`
                    );
                    continue;
                }

                const userId = await generateCustomId(tx, ROLES.USER);
                const hashedPassword = await hashPassword(entry.user.password);

                const user = await tx.user.create({
                    data: {
                        userId,
                        roleId,
                        ...entry.user,
                        password: hashedPassword,
                        profileImageUrl:
                            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif"
                    }
                });

                const employeeId = await generateCustomId(tx, ROLES.EMPLOYEE);
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
            }
        },
        {
            // maxWait: 10000,
            timeout: 15000
        }
    );
}

async function seedAllUsers() {
    try {
        console.log("🌱 Seeding users...");
        await seedAdminUsers();
        await seedSuperAdminUsers();
        await seedCustomerUsers();
        await seedSupplierUsers();
        await seedKeyAreaManagerUsers();
        console.log("✅ All users seeded successfully.");
    } catch (error) {
        console.error("❌ Seeder Error:", error);
    }
}

if (require.main === module) {
    seedAllUsers()
        .catch((error) => {
            console.error("❌ Seeding failed:", error);
            process.exit(1);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedAllUsers;
