const { v4: uuidv4 } = require("uuid");

module.exports = [
    // 🏠 Marketing & Homepage Tags
    {
        groupId: uuidv4(),
        groupName: "🏠 Homepage / Campaign Tags",
        groupDescription:
            "Tags that drive visibility and conversions for featured, trending, or promoted plants.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Featured",
                tagDesc: "✨ Handpicked by team",
                tagIcon: "✨"
            },
            {
                tagId: uuidv4(),
                tagName: "Best Seller",
                tagDesc: "🔥 Top performing product",
                tagIcon: "🔥"
            },
            {
                tagId: uuidv4(),
                tagName: "Trending",
                tagDesc: "📈 Popular right now",
                tagIcon: "📈"
            },
            {
                tagId: uuidv4(),
                tagName: "New Launch",
                tagDesc: "🆕 Recently added to our collection",
                tagIcon: "🆕"
            },
            {
                tagId: uuidv4(),
                tagName: "Limited Edition",
                tagDesc: "🏷️ Only a few in stock",
                tagIcon: "🏷️"
            },
            {
                tagId: uuidv4(),
                tagName: "Back in Stock",
                tagDesc: "🔁 You asked, it's here again!",
                tagIcon: "🔁"
            },
            {
                tagId: uuidv4(),
                tagName: "Combo Deal",
                tagDesc: "🎁 Special bundled offer",
                tagIcon: "🎁"
            },
            {
                tagId: uuidv4(),
                tagName: "Flash Sale",
                tagDesc: "⚡ Discount for a limited time",
                tagIcon: "⚡"
            },
            {
                tagId: uuidv4(),
                tagName: "Admin Pick",
                tagDesc: "💼 Loved by our team",
                tagIcon: "💼"
            },
            {
                tagId: uuidv4(),
                tagName: "Customer Favorite",
                tagDesc: "❤️ Rated by our happy buyers",
                tagIcon: "❤️"
            }
        ]
    },

    // 📦 Availability / Shipping Tags
    {
        groupId: uuidv4(),
        groupName: "📦 Availability & Shipping Tags",
        groupDescription: "Indicate real-time stock and delivery conditions.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "In Stock",
                tagDesc: "✅ Available now",
                tagIcon: "✅"
            },
            {
                tagId: uuidv4(),
                tagName: "Low Stock",
                tagDesc: "⏳ Few left",
                tagIcon: "⚠️"
            },
            {
                tagId: uuidv4(),
                tagName: "Back Soon",
                tagDesc: "🕒 Restocking in progress",
                tagIcon: "🔄"
            },
            {
                tagId: uuidv4(),
                tagName: "Fast Delivery",
                tagDesc: "🚚 Ships quickly",
                tagIcon: "🚚"
            },
            {
                tagId: uuidv4(),
                tagName: "Pan-India Shipping",
                tagDesc: "🗺️ Ships across India",
                tagIcon: "📦"
            },
            {
                tagId: uuidv4(),
                tagName: "Preorder",
                tagDesc: "📆 Book in advance",
                tagIcon: "📆"
            }
        ]
    },

    // 💝 Gifting & Occasion Tags
    {
        groupId: uuidv4(),
        groupName: "💝 Gift Tags",
        groupDescription:
            "Suggest plants for specific gifting purposes and special days.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Best for Birthday",
                tagDesc: "🎂 Makes a joyful gift",
                tagIcon: "🎂"
            },
            {
                tagId: uuidv4(),
                tagName: "Anniversary Gift",
                tagDesc: "💖 Romantic & memorable",
                tagIcon: "💖"
            },
            {
                tagId: uuidv4(),
                tagName: "Housewarming",
                tagDesc: "🏡 Perfect for new homes",
                tagIcon: "🏡"
            },
            {
                tagId: uuidv4(),
                tagName: "Corporate Gift",
                tagDesc: "💼 Elegant desk gift",
                tagIcon: "💼"
            },
            {
                tagId: uuidv4(),
                tagName: "Festive Gifting",
                tagDesc: "🎁 Diwali, Holi & more",
                tagIcon: "🎁"
            },
            {
                tagId: uuidv4(),
                tagName: "Get Well Soon",
                tagDesc: "🌼 Cheer someone up",
                tagIcon: "🌼"
            },
            {
                tagId: uuidv4(),
                tagName: "Return Gift",
                tagDesc: "🎉 Thank your guests",
                tagIcon: "🎉"
            }
        ]
    },

    // 💧 Plant Care Difficulty
    {
        groupId: uuidv4(),
        groupName: "💧 Plant Care Difficulty",
        groupDescription:
            "Tag plants based on ease of maintenance and suitability.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Beginner Friendly",
                tagDesc: "🐣 For new plant parents",
                tagIcon: "🐣"
            },
            {
                tagId: uuidv4(),
                tagName: "Easy Care",
                tagDesc: "🌿 Low effort needed",
                tagIcon: "🌿"
            },
            {
                tagId: uuidv4(),
                tagName: "Moderate Care",
                tagDesc: "🌱 Some attention required",
                tagIcon: "🌱"
            },
            {
                tagId: uuidv4(),
                tagName: "High Maintenance",
                tagDesc: "🪴 Demands time & effort",
                tagIcon: "🪴"
            }
        ]
    },

    // 🌍 Eco / Sustainability Tags
    {
        groupId: uuidv4(),
        groupName: "🌍 Eco-Friendly Tags",
        groupDescription:
            "Highlight sustainability, conservation, and low-waste packaging.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Eco-Friendly",
                tagDesc: "♻️ Sustainable product",
                tagIcon: "♻️"
            },
            {
                tagId: uuidv4(),
                tagName: "Zero Waste Kit",
                tagDesc: "🧺 Reusable & clean",
                tagIcon: "🧺"
            },
            {
                tagId: uuidv4(),
                tagName: "Plastic Free Packaging",
                tagDesc: "📦 Environmentally conscious",
                tagIcon: "🌿"
            },
            {
                tagId: uuidv4(),
                tagName: "Biodiversity Boost",
                tagDesc: "🌳 Supports wildlife",
                tagIcon: "🌳"
            },
            {
                tagId: uuidv4(),
                tagName: "Water Efficient",
                tagDesc: "💧 Less water needed",
                tagIcon: "💧"
            }
        ]
    },

    // 🛕 Cultural / Spiritual Tags
    {
        groupId: uuidv4(),
        groupName: "🛕 Cultural & Spiritual Tags",
        groupDescription:
            "Emphasize spiritual or traditional significance of certain plants.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Sacred Plant",
                tagDesc: "🛕 Used in rituals",
                tagIcon: "🛕"
            },
            {
                tagId: uuidv4(),
                tagName: "Vastu Friendly",
                tagDesc: "🧭 Positive energy",
                tagIcon: "🧭"
            },
            {
                tagId: uuidv4(),
                tagName: "Feng Shui Plant",
                tagDesc: "🌪️ Harmony & balance",
                tagIcon: "🌪️"
            }
        ]
    },

    // 🌱 Purpose & Benefits
    {
        groupId: uuidv4(),
        groupName: "🌱 Purpose / Benefit Tags",
        groupDescription: "Explain what this plant helps with or improves.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Air Purifying",
                tagDesc: "🌀 Cleans the air",
                tagIcon: "🌀"
            },
            {
                tagId: uuidv4(),
                tagName: "Mood Lifter",
                tagDesc: "🌈 Boosts happiness",
                tagIcon: "🌈"
            },
            {
                tagId: uuidv4(),
                tagName: "Stress Reliever",
                tagDesc: "😌 Soothing presence",
                tagIcon: "😌"
            },
            {
                tagId: uuidv4(),
                tagName: "Pet Friendly",
                tagDesc: "🐾 Safe for pets",
                tagIcon: "🐾"
            },
            {
                tagId: uuidv4(),
                tagName: "Mosquito Repellent",
                tagDesc: "🦟 Keeps bugs away",
                tagIcon: "🦟"
            }
        ]
    },

    // 🖼️ Aesthetic / Decor Tags
    {
        groupId: uuidv4(),
        groupName: "🖼️ Aesthetic & Decor Tags",
        groupDescription:
            "Help customers select plants by look, vibe, and placement.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Boho Vibes",
                tagDesc: "🌸 Artistic & casual",
                tagIcon: "🌸"
            },
            {
                tagId: uuidv4(),
                tagName: "Minimalist",
                tagDesc: "🧼 Simple & elegant",
                tagIcon: "🧼"
            },
            {
                tagId: uuidv4(),
                tagName: "Office Ready",
                tagDesc: "🏢 Perfect for workspaces",
                tagIcon: "🏢"
            },
            {
                tagId: uuidv4(),
                tagName: "Balcony Friendly",
                tagDesc: "🌤️ Suits small spaces",
                tagIcon: "🌤️"
            },
            {
                tagId: uuidv4(),
                tagName: "Table Top",
                tagDesc: "📏 Small & compact",
                tagIcon: "📏"
            },
            {
                tagId: uuidv4(),
                tagName: "Statement Plant",
                tagDesc: "🌟 Big, bold, and beautiful",
                tagIcon: "🌟"
            }
        ]
    },

    // 🗓️ Seasonal Tags
    {
        groupId: uuidv4(),
        groupName: "🗓️ Seasonal Tags",
        groupDescription:
            "Great for tagging plants by availability or festive season.",
        tags: [
            {
                tagId: uuidv4(),
                tagName: "Summer Special",
                tagDesc: "☀️ Thrives in heat",
                tagIcon: "☀️"
            },
            {
                tagId: uuidv4(),
                tagName: "Monsoon Friendly",
                tagDesc: "🌧️ Loves rain",
                tagIcon: "🌧️"
            },
            {
                tagId: uuidv4(),
                tagName: "Winter Resilient",
                tagDesc: "❄️ Handles the cold",
                tagIcon: "❄️"
            },
            {
                tagId: uuidv4(),
                tagName: "Diwali Special",
                tagDesc: "🪔 Festival of Lights pick",
                tagIcon: "🪔"
            },
            {
                tagId: uuidv4(),
                tagName: "Christmas Plant",
                tagDesc: "🎄 Holiday cheer",
                tagIcon: "🎄"
            }
        ]
    }
];
