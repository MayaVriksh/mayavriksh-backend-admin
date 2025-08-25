const { prisma } = require("../../config/prisma.config");
const tagGroupsWithTags = require("../data/tags.data");
const generateCustomId = require("../../utils/generateCustomId");

async function seedTags() {
    console.log("🌱 Seeding tag groups and tags...");

    try {
        await prisma.$transaction(
            async (tx) => {
                for (const group of tagGroupsWithTags) {
                    if (!group?.groupName || !Array.isArray(group.tags)) {
                        console.warn(`⚠️  Skipping invalid group data:`, group);
                        continue;
                    }

                    const existingGroup = await tx.tagGroups.findFirst({
                        where: { groupName: group.groupName }
                    });

                    if (existingGroup) {
                        console.log(
                            `⚠️  Tag group '${group.groupName}' already exists`
                        );
                        continue;
                    }

                    const groupId = await generateCustomId(tx, "TAG_GROUP");

                    const tagsWithIds = [];
                    for (const tag of group.tags) {
                        const tagId = await generateCustomId(tx, "TAG");
                        tagsWithIds.push({
                            tagId,
                            tagName: tag.tagName,
                            tagDesc: tag.tagDesc,
                            tagIcon: tag.tagIcon
                        });
                    }

                    const createdGroup = await tx.tagGroups.create({
                        data: {
                            groupId,
                            groupName: group.groupName,
                            groupDescription: group.groupDescription,
                            Tags: {
                                create: tagsWithIds
                            }
                        }
                    });

                    console.log(
                        `🌿 Created group: ${createdGroup.groupName} with ${group.tags.length} tags.`
                    );
                }
            },
            {
                // maxWait: 20000,
                timeout: 15000
            }
        );

        console.log("✅ Tag seeding completed.");
    } catch (error) {
        console.error(
            "❌ Error while seeding tag groups:",
            error.stack || error
        );
    }
}

if (require.main === module) {
    seedTags()
        .catch((e) => {
            console.error("❌ Seeding failed:", e.stack || e);
        })
        .finally(async () => {
            await prisma.$disconnect();
        });
}

module.exports = seedTags;
