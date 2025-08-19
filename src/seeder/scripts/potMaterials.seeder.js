const prisma = require("../../config/prisma.config");
const materials = require("../data/potMaterials.data");
const { v4: uuidv4 } = require("uuid");

async function seedPotMaterials() {
    try {
        console.log("🔍 Checking existing pot materials...");

        await prisma.$transaction(
            async (tx) => {
                for (const material of materials) {
                    const existing = await tx.potMaterial.findFirst({
                        where: { name: material.name }
                    });

                    if (existing) {
                        console.log(
                            `⚠️  Material '${material.name}' already exists`
                        );
                        continue;
                    }

                    await tx.potMaterial.create({
                        data: {
                            materialId: uuidv4(),
                            name: material.name
                        }
                    });

                    console.log(`✅ Material '${material.name}' created`);
                }
            },
            {
                maxWait: 25000,
                timeout: 35000
            }
        );

        console.log("🎉 Pot materials seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding pot materials:", error.stack || error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedPotMaterials().catch((e) => {
        console.error("❌ Seeding failed:", e.stack || e);
    });
}

module.exports = seedPotMaterials;
