const { v4: uuidv4 } = require("uuid");

module.exports = [
    {
        name: "Areca Palm",
        description: "Elegant air-purifying palm for indoor spaces.",
        dateAdded: new Date(),
        isProductActive: true,
        isFeatured: true,
        scientificName: "Dypsis lutescens",
        maintenance: "Low",
        plantSize: "Medium",
        placeOfOrigin: "Madagascar",
        variants: Array.from({ length: 5 }).map((_, i) => ({
            variantId: uuidv4(),
            plantSize: ["S", "M", "L", "XL", "XXL"][i],
            height: 30 + i * 20,
            weight: 0.5 + i * 0.7,
            sku: `ARECA-${i + 1}`,
            mrp: 349 + i * 100
        }))
    },
    {
        name: "Snake Plant",
        description: "Hardy and great for air purification.",
        dateAdded: new Date(),
        isProductActive: true,
        isFeatured: false,
        scientificName: "Sansevieria trifasciata",
        maintenance: "Very Low",
        plantSize: "Small",
        placeOfOrigin: "West Africa",
        variants: Array.from({ length: 5 }).map((_, i) => ({
            variantId: uuidv4(),
            plantSize: ["Small", "Medium", "Tall", "Compact", "Mini"][i],
            height: 20 + i * 10,
            weight: 0.4 + i * 0.3,
            sku: `SNAKE-${i + 1}`,
            mrp: 299 + i * 100
        }))
    },
    {
        name: "ZZ Plant",
        description: "Glossy leaves and great for low-light.",
        dateAdded: new Date(),
        isProductActive: true,
        isFeatured: true,
        scientificName: "Zamioculcas zamiifolia",
        maintenance: "Low",
        placeOfOrigin: "East Africa",
        variants: Array.from({ length: 5 }).map((_, i) => ({
            variantId: uuidv4(),
            plantSize: ["Compact", "Small", "Medium", "Tall", "XL"][i],
            height: 25 + i * 10,
            weight: 0.5 + i * 0.4,
            sku: `ZZ-${i + 1}`,
            mrp: 399 + i * 120
        }))
    },
    {
        name: "Peace Lily",
        description: "Flowering indoor plant, excellent for bedrooms.",
        dateAdded: new Date(),
        isProductActive: true,
        isFeatured: false,
        scientificName: "Spathiphyllum",
        maintenance: "Medium",
        placeOfOrigin: "Tropical Americas",
        variants: Array.from({ length: 5 }).map((_, i) => ({
            variantId: uuidv4(),
            plantSize: ["Small", "Petite", "Blooming", "XL", "Decor"][i],
            height: 20 + i * 12,
            weight: 0.4 + i * 0.5,
            sku: `LILY-${i + 1}`,
            mrp: 499 + i * 110
        }))
    },
    {
        name: "Money Plant",
        description: "Easy-to-grow and auspicious for homes.",
        dateAdded: new Date(),
        isProductActive: true,
        isFeatured: true,
        scientificName: "Epipremnum aureum",
        maintenance: "Very Low",
        placeOfOrigin: "Southeast Asia",
        variants: Array.from({ length: 5 }).map((_, i) => ({
            variantId: uuidv4(),
            plantSize: [
                "Basic",
                "Hanging",
                "Water-Grown",
                "XL Potted",
                "Table Top"
            ][i],
            height: 15 + i * 8,
            weight: 0.2 + i * 0.25,
            sku: `MONEY-${i + 1}`,
            mrp: 199 + i * 90
        }))
    }
];
