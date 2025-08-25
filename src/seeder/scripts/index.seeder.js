const { prisma } = require("../../config/prisma.config");
const seedSerialTrackers = require("./serialtracker.seeder");
const seedRoles = require("./roles.seeder");
const seedWarehouses = require("./warehouses.seeder");
const seedUsers = require("./users/users.seeder");
const seedTags = require("./tags.seeder");
const seedColors = require("./colors.seeder");
const seedPotMaterials = require("./potMaterials.seeder");
const seedPlants = require("./plants.seeder");
const seedPotMaterials = require("./potMaterials.seeder");
const seedPots = require("./pots.seeder");
const seedPurchaseOrders = require("./purchaseorder.seeder");

async function runSeeder() {
    console.log("🌱 Starting full seeding...");

    try {
        await seedSerialTrackers();
        await seedRoles();
        await seedWarehouses();
        await seedUsers();
        await seedTags();
        await seedColors();
        await seedPotMaterials();
        await seedPlants();
        await seedPotMaterials();
        await seedPots();
        await seedPurchaseOrders();

        console.log("✅ All seeders executed successfully!");
    } catch (error) {
        console.error("❌ Error while seeding:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    runSeeder();
}
