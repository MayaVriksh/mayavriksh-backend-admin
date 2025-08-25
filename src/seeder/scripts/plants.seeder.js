const { prisma } = require("../../config/prisma.config");
const { PRODUCT_TYPES } = require("../../constants/general.constant");
const generateCustomId = require("../../utils/generateCustomId");
const {
    plants,
    plantSizeProfiles,
    plantVariants
} = require("../data/plants.data");

async function seedPlants() {
    try {
        console.log("🌿 Fetching colors from DB...");
        const colors = await prisma.color.findMany();

        if (!colors.length) {
            throw new Error("❌ No colors found. Please seed colors first.");
        }

        console.log("🌱 Seeding Plants, Size Profiles and Variants...");

        for (const plant of plants) {
            try {
                await prisma.$transaction(
                    async (tx) => {
                        const existingPlant = await tx.plants.findFirst({
                            where: { name: plant.name }
                        });

                        if (existingPlant) {
                            console.log(
                                `⚠️ Plant '${plant.name}' already exists`
                            );
                            return;
                        }

                        const plantId = await generateCustomId(
                            tx,
                            PRODUCT_TYPES.PLANT
                        );

                        const createdPlant = await tx.plants.create({
                            data: {
                                plantId,
                                name: plant.name,
                                description: plant.description,
                                isProductActive: plant.isProductActive,
                                isFeatured: plant.isFeatured,
                                scientificName: plant.scientificName,
                                maintenance: plant.maintenance,
                                placeOfOrigin: plant.placeOfOrigin,
                                auraType: plant.auraType,
                                bestForEmotion: plant.bestForEmotion,
                                bestGiftFor: plant.bestGiftFor,
                                biodiversityBooster: plant.biodiversityBooster,
                                carbonAbsorber: plant.carbonAbsorber,
                                funFacts: plant.funFacts,
                                godAligned: plant.godAligned,
                                insideBox: plant.insideBox,
                                plantSeries: plant.plantSeries,
                                repotting: plant.repotting,
                                soil: plant.soil,
                                spiritualUseCase: plant.spiritualUseCase
                            }
                        });

                        console.log(`🌱 Created Plant '${plant.name}'`);

                        // size profiles
                        const sizesForPlant = plantSizeProfiles.filter(
                            (s) => s.plantId === plant.plantId
                        );

                        const sizeIdMap = {};
                        for (const sizeProfile of sizesForPlant) {
                            const plantSizeId = await generateCustomId(
                                tx,
                                PRODUCT_TYPES.PLANT_SIZE
                            );

                            await tx.plantSizeProfile.create({
                                data: {
                                    plantSizeId,
                                    plantId: createdPlant.plantId,
                                    plantSize: sizeProfile.plantSize,
                                    height: sizeProfile.height,
                                    weight: sizeProfile.weight
                                }
                            });

                            sizeIdMap[sizeProfile.plantSizeId] = plantSizeId;

                            console.log(
                                `   ➕ Size Profile (${sizeProfile.plantSize}) added for '${plant.name}'`
                            );
                        }

                        // variants
                        const variantsForPlant = plantVariants.filter(
                            (v) => v.plantId === plant.plantId
                        );

                        for (let i = 0; i < variantsForPlant.length; i++) {
                            const variant = variantsForPlant[i];
                            const color = colors[i % colors.length];

                            const variantId = await generateCustomId(
                                tx,
                                PRODUCT_TYPES.PLANT_VARIANT
                            );

                            await tx.plantVariants.create({
                                data: {
                                    variantId,
                                    plantId: createdPlant.plantId,
                                    plantSizeId: sizeIdMap[variant.plantSizeId],
                                    colorId: color.id,
                                    sku: variant.sku,
                                    mrp: variant.mrp,
                                    isProductActive: variant.isProductActive
                                }
                            });

                            console.log(
                                `   🌿 Variant ${variant.sku} added for '${plant.name}'`
                            );
                        }

                        console.log(
                            `✅ Plant '${plant.name}' seeded with ${sizesForPlant.length} sizes & ${variantsForPlant.length} variants`
                        );
                    },
                    { timeout: 15000 }
                );
            } catch (error) {
                console.error(
                    `❌ Failed seeding '${plant.name}':`,
                    error.message
                );
            }
        }

        console.log(
            "🎉 All plants, size profiles and variants seeding completed."
        );
    } catch (error) {
        console.error("❌ Error seeding plants:", error.stack || error);
    }
}

if (require.main === module) {
    seedPlants()
        .catch((e) => {
            console.error("❌ Seeding failed:", e.stack || e);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedPlants;
