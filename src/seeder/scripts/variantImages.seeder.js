const prisma = require("../../config/prisma.config");
const { MEDIA_TYPES } = require("../../constants/general.constant");
const { v4: uuidv4 } = require("uuid");

const imageData = [
    {
        publicId: "suppliers/trade_licenses/trade_license_1753016064393",
        mediaUrl:
            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1753016064393.avif",
        isPrimary: false
    },
    {
        publicId: "suppliers/trade_licenses/trade_license_1751201462225",
        mediaUrl:
            "https://res.cloudinary.com/dwdu18hzs/image/upload/suppliers/trade_licenses/trade_license_1751201462225.avif",
        isPrimary: true
    }
];

async function seedPotVariantImages() {
    const potVariants = await prisma.potVariants.findMany();

    if (!potVariants.length) {
        console.warn("❌ No pot variants found.");
        return;
    }

    for (const variant of potVariants) {
        const existingImages = await prisma.potVariantImage.findMany({
            where: { potVariantId: variant.potVariantId }
        });

        if (existingImages.length > 0) {
            console.log(
                `⚠️  Images already exist for PotVariant ${variant.potVariantId}, skipping...`
            );
            continue;
        }

        const imageEntries = imageData.map(image => ({
            id: uuidv4(),
            potVariantId: variant.potVariantId,
            publicId: image.publicId,
            mediaUrl: image.mediaUrl,
            mediaType: MEDIA_TYPES.IMAGE,
            resourceType: "image",
            isPrimary: image.isPrimary
        }));

        await prisma.potVariantImage.createMany({
            data: imageEntries,
            skipDuplicates: true
        });

        console.log(`✅ PotVariant ${variant.potVariantId}: Images added.`);
    }
}

async function seedPlantVariantImages() {
    const plantVariants = await prisma.plantVariants.findMany();

    if (!plantVariants.length) {
        console.warn("❌ No plant variants found.");
        return;
    }

    for (const variant of plantVariants) {
        const existingImages = await prisma.plantVariantImage.findMany({
            where: { plantVariantId: variant.variantId }
        });

        if (existingImages.length > 0) {
            console.log(
                `⚠️  Images already exist for PlantVariant ${variant.variantId}, skipping...`
            );
            continue;
        }

        const imageEntries = imageData.map(image => ({
            id: uuidv4(),
            plantVariantId: variant.variantId,
            publicId: image.publicId,
            mediaUrl: image.mediaUrl,
            mediaType: MEDIA_TYPES.IMAGE,
            resourceType: "image",
            isPrimary: image.isPrimary
        }));

        await prisma.plantVariantImage.createMany({
            data: imageEntries,
            skipDuplicates: true
        });

        console.log(`✅ PlantVariant ${variant.variantId}: Images added.`);
    }
}

async function seedVariantImages() {
    try {
        console.log("🖼️ Seeding Pot & Plant Variant Images...");
        await seedPotVariantImages();
        await seedPlantVariantImages();
        console.log("🎉 All variant images seeded successfully.");
    } catch (error) {
        console.error("❌ Error seeding variant images:", error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    seedVariantImages();
}

module.exports = seedVariantImages;
