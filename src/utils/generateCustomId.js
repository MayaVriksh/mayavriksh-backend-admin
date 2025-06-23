const { v4: uuidv4 } = require("uuid");
const prisma = require("../config/prisma.config");
const ENTITY_PREFIX = require("../constants/prefix.constant");

async function generateCustomId(entityKey) {
    const entityCode = ENTITY_PREFIX[entityKey];
    if (!entityCode) throw new Error(`Unknown entityKey: ${entityKey}`);

    const year = new Date().getFullYear() % 100; // e.g., 25 for 2025
    const uuid = uuidv4().replace(/-/g, "").toUpperCase();
    const prefixLength = entityCode.length;

    // Determine how many characters to use from UUID
    const uuidLength = prefixLength === 4 ? 7 : 8;
    const uuidPart = uuid.slice(0, uuidLength);

    const tracker = await prisma.serialTracker.upsert({
        where: {
            entityCode_year: {
                entityCode,
                year
            }
        },
        update: {
            lastSerial: { increment: 1 }
        },
        create: {
            entityCode,
            year,
            lastSerial: 1
        }
    });

    const serialStr = String(tracker.lastSerial).padStart(4, "0");

    return `${entityCode}-${year}-${uuidPart}-${serialStr}`;
}

module.exports = generateCustomId;
