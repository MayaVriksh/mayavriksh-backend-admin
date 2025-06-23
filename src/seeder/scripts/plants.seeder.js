const prisma = require("../../config/prisma.config");
const { PRODUCT_TYPES } = require("../../constants/general.constant");
const generateCustomId = require("../../utils/generateCustomId");
const plants = require("../data/plants.data");

async function seedPlants() {
    try {
        console.log("🌿 Fetching colors from DB...");
        const colors = await prisma.color.findMany();

        if (!colors.length) {
            throw new Error("❌ No colors found. Please seed colors first.");
        }

        console.log("🌱 Seeding Plants and Variants...");

        for (const plant of plants) {
            try {
                const existingPlant = await prisma.plants.findFirst({
                    where: { name: plant.name }
                });

                if (existingPlant) {
                    console.log(`⚠️  Plant '${plant.name}' already exists`);
                    continue;
                }

                await prisma.$transaction(async tx => {
                    const plantId = await generateCustomId(PRODUCT_TYPES.PLANT);

                    const createdPlant = await tx.plants.create({
                        data: {
                            plantId,
                            name: plant.name,
                            description: plant.description,
                            dateAdded: plant.dateAdded,
                            isProductActive: plant.isProductActive,
                            isFeatured: plant.isFeatured,
                            scientificName: plant.scientificName,
                            maintenance: plant.maintenance,
                            placeOfOrigin: plant.placeOfOrigin
                        }
                    });

                    for (let i = 0; i < plant.variants.length; i++) {
                        const variant = plant.variants[i];
                        const color = colors[i % colors.length];

                        await tx.plantVariants.create({
                            data: {
                                variantId: variant.variantId,
                                plantId: createdPlant.plantId,
                                colorId: color.id,
                                plantSize: variant.plantSize,
                                height: variant.height,
                                weight: variant.weight,
                                sku: variant.sku,
                                mrp: variant.mrp,
                                isAvailable: variant.isAvailable
                            }
                        });
                    }

                    console.log(
                        `✅ Plant '${plant.name}' with ${plant.variants.length} variants created`
                    );
                });
            } catch (error) {
                console.error(
                    `❌ Error with plant '${plant.name}':`,
                    error.message
                );
            }
        }

        console.log("🎉 All plants and their variants seeding completed.");
    } catch (error) {
        console.error("❌ Error seeding plants:", error.message);
    }
}

if (require.main === module) {
    seedPlants()
        .catch(e => {
            console.error("❌ Seeding failed:", e);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedPlants;
