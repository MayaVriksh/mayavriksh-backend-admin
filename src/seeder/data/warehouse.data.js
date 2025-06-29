const {
    STREET_ADDRESS,
    CITY,
    STATE,
    COUNTRY,
    PIN_CODE,
    LANDMARK,
    LATITUDE,
    LONGITUDE
} = require("../../constants/general.constant.js");

const warehouses = [
    {
        name: "North Zone Central Warehouse",
        capacityUnits: 50000,
        officeEmail: "northzone@mayavriksh.com",
        officePhone: "+919123456780",
        officeAddress: {
            [STREET_ADDRESS]: "12 Evergreen Road",
            [CITY]: "Delhi",
            [STATE]: "Delhi",
            [COUNTRY]: "India",
            [PIN_CODE]: "110001",
            [LANDMARK]: "Near North Botanical Garden",
            [LATITUDE]: "28.6139",
            [LONGITUDE]: "77.2090"
        }
    },
    {
        name: "Western Regional Depot",
        capacityUnits: 30000,
        officeEmail: "westdepot@mayavriksh.com",
        officePhone: "+919134567890",
        officeAddress: {
            [STREET_ADDRESS]: "45 Cactus Avenue",
            [CITY]: "Mumbai",
            [STATE]: "Maharashtra",
            [COUNTRY]: "India",
            [PIN_CODE]: "400001",
            [LANDMARK]: "Opp. Western Flower Market",
            [LATITUDE]: "18.9388",
            [LONGITUDE]: "72.8354"
        }
    },
    {
        name: "Eastern Plant Storage Hub",
        capacityUnits: 20000,
        officeEmail: "eaststorage@mayavriksh.com",
        officePhone: "+919145678901",
        officeAddress: {
            [STREET_ADDRESS]: "88 Lotus Lane",
            [CITY]: "Kolkata",
            [STATE]: "West Bengal",
            [COUNTRY]: "India",
            [PIN_CODE]: "700001",
            [LANDMARK]: "Near Eastern Green Park",
            [LATITUDE]: "22.5726",
            [LONGITUDE]: "88.3639"
        }
    },
    {
        name: "Southern Supply Chain Center",
        capacityUnits: 45000,
        officeEmail: "southcenter@mayavriksh.com",
        officePhone: "+919156789012",
        officeAddress: {
            [STREET_ADDRESS]: "27 Tulsi Drive",
            [CITY]: "Chennai",
            [STATE]: "Tamil Nadu",
            [COUNTRY]: "India",
            [PIN_CODE]: "600001",
            [LANDMARK]: "Beside South Wholesale Nursery",
            [LATITUDE]: "13.0827",
            [LONGITUDE]: "80.2707"
        }
    },
    {
        name: "Central Inventory & Restock Node",
        capacityUnits: 55000,
        officeEmail: "centralnode@mayavriksh.com",
        officePhone: "+919167890123",
        officeAddress: {
            [STREET_ADDRESS]: "101 Neem Marg",
            [CITY]: "Nagpur",
            [STATE]: "Maharashtra",
            [COUNTRY]: "India",
            [PIN_CODE]: "440001",
            [LANDMARK]: "Near Central Agro Yard",
            [LATITUDE]: "21.1458",
            [LONGITUDE]: "79.0882"
        }
    }
];

module.exports = warehouses;
