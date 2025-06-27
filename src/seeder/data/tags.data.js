const { v4: uuidv4 } = require("uuid");

module.exports = [
    // 🏠 Marketing & Homepage Tags
    {
        groupName: "🏠 Homepage / Campaign Tags",
        groupDescription:
            "Tags that drive visibility and conversions for featured, trending, or promoted plants.",
        tags: [
            {
                tagName: "Featured",
                tagDesc: "✨ Handpicked by team",
                tagIcon: "✨"
            },
            {
                tagName: "Best Seller",
                tagDesc: "🔥 Top performing product",
                tagIcon: "🔥"
            },
            {
                tagName: "Trending",
                tagDesc: "📈 Popular right now",
                tagIcon: "📈"
            },
            {
                tagName: "New Launch",
                tagDesc: "🆕 Recently added to our collection",
                tagIcon: "🆕"
            },
            {
                tagName: "Limited Edition",
                tagDesc: "🏷️ Only a few in stock",
                tagIcon: "🏷️"
            },
            {
                tagName: "Back in Stock",
                tagDesc: "🔁 You asked, it's here again!",
                tagIcon: "🔁"
            },
            {
                tagName: "Combo Deal",
                tagDesc: "🎁 Special bundled offer",
                tagIcon: "🎁"
            },
            {
                tagName: "Flash Sale",
                tagDesc: "⚡ Discount for a limited time",
                tagIcon: "⚡"
            },
            {
                tagName: "Admin Pick",
                tagDesc: "💼 Loved by our team",
                tagIcon: "💼"
            },
            {
                tagName: "Customer Favorite",
                tagDesc: "❤️ Rated by our happy buyers",
                tagIcon: "❤️"
            }
        ]
    },

    // 📦 Availability / Shipping Tags
    {
        groupName: "📦 Availability & Shipping Tags",
        groupDescription: "Indicate real-time stock and delivery conditions.",
        tags: [
            {
                tagName: "In Stock",
                tagDesc: "✅ Available now",
                tagIcon: "✅"
            },
            {
                tagName: "Low Stock",
                tagDesc: "⏳ Few left",
                tagIcon: "⚠️"
            },
            {
                tagName: "Back Soon",
                tagDesc: "🕒 Restocking in progress",
                tagIcon: "🔄"
            },
            {
                tagName: "Fast Delivery",
                tagDesc: "🚚 Ships quickly",
                tagIcon: "🚚"
            },
            {
                tagName: "Pan-India Shipping",
                tagDesc: "🗺️ Ships across India",
                tagIcon: "📦"
            },
            {
                tagName: "Preorder",
                tagDesc: "📆 Book in advance",
                tagIcon: "📆"
            }
        ]
    },

    // 💝 Gifting & Occasion Tags
    {
        groupName: "💝 Gift Tags",
        groupDescription:
            "Suggest plants for specific gifting purposes and special days.",
        tags: [
            {
                tagName: "Best for Birthday",
                tagDesc: "🎂 Makes a joyful gift",
                tagIcon: "🎂"
            },
            {
                tagName: "Anniversary Gift",
                tagDesc: "💖 Romantic & memorable",
                tagIcon: "💖"
            },
            {
                tagName: "Housewarming",
                tagDesc: "🏡 Perfect for new homes",
                tagIcon: "🏡"
            },
            {
                tagName: "Corporate Gift",
                tagDesc: "💼 Elegant desk gift",
                tagIcon: "💼"
            },
            {
                tagName: "Festive Gifting",
                tagDesc: "🎁 Diwali, Holi & more",
                tagIcon: "🎁"
            },
            {
                tagName: "Get Well Soon",
                tagDesc: "🌼 Cheer someone up",
                tagIcon: "🌼"
            },
            {
                tagName: "Return Gift",
                tagDesc: "🎉 Thank your guests",
                tagIcon: "🎉"
            }
        ]
    },

    // 💧 Plant Care Difficulty
    {
        groupName: "💧 Plant Care Difficulty",
        groupDescription:
            "Tag plants based on ease of maintenance and suitability.",
        tags: [
            {
                tagName: "Beginner Friendly",
                tagDesc: "🐣 For new plant parents",
                tagIcon: "🐣"
            },
            {
                tagName: "Easy Care",
                tagDesc: "🌿 Low effort needed",
                tagIcon: "🌿"
            },
            {
                tagName: "Moderate Care",
                tagDesc: "🌱 Some attention required",
                tagIcon: "🌱"
            },
            {
                tagName: "High Maintenance",
                tagDesc: "🪴 Demands time & effort",
                tagIcon: "🪴"
            }
        ]
    },

    // 🌍 Eco / Sustainability Tags
    {
        groupName: "🌍 Eco-Friendly Tags",
        groupDescription:
            "Highlight sustainability, conservation, and low-waste packaging.",
        tags: [
            {
                tagName: "Eco-Friendly",
                tagDesc: "♻️ Sustainable product",
                tagIcon: "♻️"
            },
            {
                tagName: "Zero Waste Kit",
                tagDesc: "🧺 Reusable & clean",
                tagIcon: "🧺"
            },
            {
                tagName: "Plastic Free Packaging",
                tagDesc: "📦 Environmentally conscious",
                tagIcon: "🌿"
            },
            {
                tagName: "Biodiversity Boost",
                tagDesc: "🌳 Supports wildlife",
                tagIcon: "🌳"
            },
            {
                tagName: "Water Efficient",
                tagDesc: "💧 Less water needed",
                tagIcon: "💧"
            }
        ]
    },

    // 🛕 Cultural / Spiritual Tags
    {
        groupName: "🛕 Cultural & Spiritual Tags",
        groupDescription:
            "Emphasize spiritual or traditional significance of certain plants.",
        tags: [
            {
                tagName: "Sacred Plant",
                tagDesc: "🛕 Used in rituals",
                tagIcon: "🛕"
            },
            {
                tagName: "Vastu Friendly",
                tagDesc: "🧭 Positive energy",
                tagIcon: "🧭"
            },
            {
                tagName: "Feng Shui Plant",
                tagDesc: "🌪️ Harmony & balance",
                tagIcon: "🌪️"
            }
        ]
    },

    // 🌱 Purpose & Benefits
    {
        groupName: "🌱 Purpose / Benefit Tags",
        groupDescription: "Explain what this plant helps with or improves.",
        tags: [
            {
                tagName: "Air Purifying",
                tagDesc: "🌀 Cleans the air",
                tagIcon: "🌀"
            },
            {
                tagName: "Mood Lifter",
                tagDesc: "🌈 Boosts happiness",
                tagIcon: "🌈"
            },
            {
                tagName: "Stress Reliever",
                tagDesc: "😌 Soothing presence",
                tagIcon: "😌"
            },
            {
                tagName: "Pet Friendly",
                tagDesc: "🐾 Safe for pets",
                tagIcon: "🐾"
            },
            {
                tagName: "Mosquito Repellent",
                tagDesc: "🦟 Keeps bugs away",
                tagIcon: "🦟"
            }
        ]
    },

    // 🖼️ Aesthetic / Decor Tags
    {
        groupName: "🖼️ Aesthetic & Decor Tags",
        groupDescription:
            "Help customers select plants by look, vibe, and placement.",
        tags: [
            {
                tagName: "Boho Vibes",
                tagDesc: "🌸 Artistic & casual",
                tagIcon: "🌸"
            },
            {
                tagName: "Minimalist",
                tagDesc: "🧼 Simple & elegant",
                tagIcon: "🧼"
            },
            {
                tagName: "Office Ready",
                tagDesc: "🏢 Perfect for workspaces",
                tagIcon: "🏢"
            },
            {
                tagName: "Balcony Friendly",
                tagDesc: "🌤️ Suits small spaces",
                tagIcon: "🌤️"
            },
            {
                tagName: "Table Top",
                tagDesc: "📏 Small & compact",
                tagIcon: "📏"
            },
            {
                tagName: "Statement Plant",
                tagDesc: "🌟 Big, bold, and beautiful",
                tagIcon: "🌟"
            }
        ]
    },

    // 🗓️ Seasonal Tags
    {
        groupName: "🗓️ Seasonal Tags",
        groupDescription:
            "Great for tagging plants by availability or festive season.",
        tags: [
            {
                tagName: "Summer Special",
                tagDesc: "☀️ Thrives in heat",
                tagIcon: "☀️"
            },
            {
                tagName: "Monsoon Friendly",
                tagDesc: "🌧️ Loves rain",
                tagIcon: "🌧️"
            },
            {
                tagName: "Winter Resilient",
                tagDesc: "❄️ Handles the cold",
                tagIcon: "❄️"
            },
            {
                tagName: "Diwali Special",
                tagDesc: "🪔 Festival of Lights pick",
                tagIcon: "🪔"
            },
            {
                tagName: "Christmas Plant",
                tagDesc: "🎄 Holiday cheer",
                tagIcon: "🎄"
            }
        ]
    }
];
