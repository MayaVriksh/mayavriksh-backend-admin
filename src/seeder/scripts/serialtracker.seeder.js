const prisma = require("../../config/prisma.config");
const serialTrackers = require("../data/serialTracker.data");

async function seedSerialTrackers() {
    console.log("🌱 Seeding SerialTracker...");

    const year = new Date().getFullYear() % 100;
    for (const tracker of serialTrackers) {
        const entityCode = tracker.entityCode;

        try {
            const existingTracker = await prisma.serialTracker.findUnique({
                where: {
                    entityCode_year: {
                        entityCode,
                        year
                    }
                }
            });

            if (!existingTracker) {
                await prisma.serialTracker.create({
                    data: {
                        entityCode,
                        year,
                        lastSerial: tracker.lastSerial
                    }
                });
                console.log(`✅ Created: ${entityCode}-${year}`);
            } else {
                console.log(
                    `⚠️  Tracker '${entityCode}-${year}' already exists`
                );
            }
        } catch (error) {
            console.error(
                `❌ Error with tracker '${entityCode}-${year}':`,
                error.message
            );
        }
    }

    console.log("✅ SerialTracker seeding completed.");
}

if (require.main === module) {
    seedSerialTrackers()
        .catch(error => {
            console.error("❌ Seeding failed:", error);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedSerialTrackers;
