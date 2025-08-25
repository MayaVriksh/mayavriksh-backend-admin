const { prisma } = require("../../config/prisma.config");
const colors = require("../data/colors.data");

async function seedColors() {
    console.log("🌈 Seeding Colors...");

    for (const color of colors) {
        try {
            const existingColor = await prisma.color.findFirst({
                where: { name: color.name }
            });

            if (!existingColor) {
                await prisma.color.create({
                    data: {
                        id: color.id,
                        name: color.name,
                        hexCode: color.hexCode
                    }
                });
                console.log(`✅ Color '${color.name}' created`);
            } else {
                console.log(`⚠️  Color '${color.name}' already exists`);
            }
        } catch (error) {
            console.error(
                `❌ Error with color '${color.name}':`,
                error.message
            );
        }
    }

    console.log("✅ Color seeding completed.");
}

if (require.main === module) {
    seedColors()
        .catch((error) => {
            console.error("❌ Seeding failed:", error);
        })
        .finally(() => {
            prisma.$disconnect();
        });
}

module.exports = seedColors;
