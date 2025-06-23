const prisma = require("../../config/prisma.config");
const tagGroupsWithTags = require("../data/tags.data");

async function seedTags() {
    console.log("🌱 Seeding tag groups and tags...");

    for (const group of tagGroupsWithTags) {
        try {
            const existingGroup = await prisma.tagGroups.findFirst({
                where: { groupName: group.groupName }
            });

            if (!existingGroup) {
                const createdGroup = await prisma.tagGroups.create({
                    data: {
                        groupId: group.groupId,
                        groupName: group.groupName,
                        groupDescription: group.groupDescription,
                        Tags: {
                            create: group.tags.map(tag => ({
                                tagId: tag.tagId,
                                tagName: tag.tagName,
                                tagDesc: tag.tagDesc,
                                tagIcon: tag.tagIcon
                            }))
                        }
                    }
                });

                console.log(
                    `🌿 Created group: ${createdGroup.groupName} with ${group.tags.length} tags.`
                );
            } else {
                console.log(
                    `⚠️  Tag group '${group.groupName}' already exists`
                );
            }
        } catch (error) {
            console.error(
                `❌ Error with tag group '${group.groupName}':`,
                error.message
            );
        }
    }

    console.log("✅ Tag seeding completed.");
}

if (require.main === module) {
    seedTags()
        .catch(e => {
            console.error("❌ Seeding failed:", e);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedTags;
