const { v4: uuid } = require("uuid");

const plants = [
    {
        plantId: uuid(),
        name: "Areca Palm",
        description: "Elegant air-purifying palm for indoor spaces.",
        scientificName: "Dypsis lutescens",
        isProductActive: true,
        isFeatured: true,
        maintenance: "Low",
        placeOfOrigin: "Madagascar",
        auraType: "Positive Energy",
        bestForEmotion: "Stress Relief",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        plantId: uuid(),
        name: "Snake Plant",
        description: "Hardy and great for air purification.",
        scientificName: "Sansevieria trifasciata",
        isProductActive: true,
        isFeatured: false,
        maintenance: "Very Low",
        placeOfOrigin: "West Africa",
        auraType: "Protection",
        bestForEmotion: "Focus",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        plantId: uuid(),
        name: "ZZ Plant",
        description: "Glossy leaves and great for low-light.",
        scientificName: "Zamioculcas zamiifolia",
        isProductActive: true,
        isFeatured: true,
        maintenance: "Low",
        placeOfOrigin: "East Africa",
        auraType: "Good Luck",
        bestForEmotion: "Calmness",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        plantId: uuid(),
        name: "Peace Lily",
        description: "Flowering indoor plant, excellent for bedrooms.",
        scientificName: "Spathiphyllum",
        isProductActive: true,
        isFeatured: false,
        maintenance: "Medium",
        placeOfOrigin: "Tropical Americas",
        auraType: "Purity",
        bestForEmotion: "Relaxation",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        plantId: uuid(),
        name: "Money Plant",
        description: "Easy-to-grow and auspicious for homes.",
        scientificName: "Epipremnum aureum",
        isProductActive: true,
        isFeatured: true,
        maintenance: "Very Low",
        placeOfOrigin: "Southeast Asia",
        auraType: "Prosperity",
        bestForEmotion: "Positivity",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const plantSizeProfiles = [];

function addSizeProfiles(plant, sizes) {
    sizes.forEach((s) => {
        plantSizeProfiles.push({
            plantSizeId: uuid(),
            plantId: plant.plantId,
            plantSize: s.plantSize,
            height: s.height,
            weight: s.weight
        });
    });
}

addSizeProfiles(plants[0], [
    { plantSize: "SMALL", height: 30, weight: 0.5 },
    { plantSize: "MEDIUM", height: 50, weight: 1.2 },
    { plantSize: "LARGE", height: 70, weight: 1.9 },
    { plantSize: "EXTRA_LARGE", height: 90, weight: 2.6 },
    { plantSize: "EXTRA_SMALL", height: 110, weight: 3.3 }
]);

addSizeProfiles(plants[1], [
    { plantSize: "SMALL", height: 20, weight: 0.4 },
    { plantSize: "MEDIUM", height: 30, weight: 0.7 },
    { plantSize: "LARGE", height: 40, weight: 1.0 },
    { plantSize: "EXTRA_LARGE", height: 50, weight: 1.3 },
    { plantSize: "EXTRA_SMALL", height: 60, weight: 1.6 }
]);

addSizeProfiles(plants[2], [
    { plantSize: "SMALL", height: 25, weight: 0.5 },
    { plantSize: "MEDIUM", height: 35, weight: 0.9 },
    { plantSize: "LARGE", height: 45, weight: 1.3 },
    { plantSize: "EXTRA_LARGE", height: 55, weight: 1.7 },
    { plantSize: "EXTRA_SMALL", height: 65, weight: 2.1 }
]);

addSizeProfiles(plants[3], [
    { plantSize: "SMALL", height: 20, weight: 0.4 },
    { plantSize: "MEDIUM", height: 32, weight: 0.9 },
    { plantSize: "LARGE", height: 44, weight: 1.4 },
    { plantSize: "EXTRA_LARGE", height: 56, weight: 1.9 },
    { plantSize: "EXTRA_SMALL", height: 68, weight: 2.4 }
]);

addSizeProfiles(plants[4], [
    { plantSize: "SMALL", height: 15, weight: 0.2 },
    { plantSize: "MEDIUM", height: 23, weight: 0.45 },
    { plantSize: "LARGE", height: 31, weight: 0.7 },
    { plantSize: "EXTRA_LARGE", height: 39, weight: 0.95 },
    { plantSize: "EXTRA_SMALL", height: 47, weight: 1.2 }
]);

const plantVariants = [];

function addVariants(plant, prefix, baseMrp) {
    const profiles = plantSizeProfiles.filter(
        (p) => p.plantId === plant.plantId
    );
    profiles.forEach((profile, i) => {
        plantVariants.push({
            variantId: uuid(),
            plantId: plant.plantId,
            plantSizeId: profile.plantSizeId,
            colorId: "default-green",
            sku: `${prefix}-${i + 1}`,
            mrp: baseMrp + i * 100,
            isProductActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    });
}

addVariants(plants[0], "ARECA", 349);
addVariants(plants[1], "SNAKE", 299);
addVariants(plants[2], "ZZ", 399);
addVariants(plants[3], "LILY", 499);
addVariants(plants[4], "MONEY", 199);

module.exports = {
    plants,
    plantSizeProfiles,
    plantVariants
};
