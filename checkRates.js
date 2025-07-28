const axios = require("axios");
const fs = require("fs");

// --- Configuration: You Must Fill These Details ---

// 1. Your Shiprocket API Token
// How to get it: Login to Shiprocket -> API -> Create an API User
const SHIPROCKET_API_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjczMzQyNzIsInNvdXJjZSI6InNyLWF1dGgtaW50IiwiZXhwIjoxNzU0NDA4NzM2LCJqdGkiOiJ5Sm1mZlpiazdRTmxYSmtDIiwiaWF0IjoxNzUzNTQ0NzM2LCJpc3MiOiJodHRwczovL3NyLWF1dGguc2hpcHJvY2tldC5pbi9hdXRob3JpemUvdXNlciIsIm5iZiI6MTc1MzU0NDczNiwiY2lkIjo2MzEwODg4LCJ0YyI6MzYwLCJ2ZXJib3NlIjpmYWxzZSwidmVuZG9yX2lkIjowLCJ2ZW5kb3JfY29kZSI6IiJ9.UNWfUf7R2eHEr2_nomeJjbI_UIX28v7fKs8StXLC_B0";

// 2. Your Warehouse Pincode
const ORIGIN_PINCODE = "712501"; // Jirat, Hooghly

// 3. Sample Package Details for Mayavriksh Plants
// (Adjust these based on your average package)
const PACKAGE_WEIGHT_KG = 1.5; // Example: 1.5 kg
const PACKAGE_LENGTH_CM = 20; // Example: 20 cm
const PACKAGE_BREADTH_CM = 20; // Example: 20 cm
const PACKAGE_HEIGHT_CM = 35; // Example: 35 cm (for a medium plant)
const DECLARED_VALUE = 500; // Example: ₹500 declared value

// --- End of Configuration ---

/**
 * Calls the Shiprocket API to check for serviceable couriers and rates.
 * @param {string} destinationPincode - The destination PIN code to check.
 * @returns {Promise<Array|null>} - A promise that resolves to an array of courier results or null.
 */
async function checkShippingRates(destinationPincode) {
    const url =
        "https://apiv2.shiprocket.in/v1/external/courier/serviceability/";
    const config = {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SHIPROCKET_API_TOKEN}`
        },
        params: {
            pickup_postcode: ORIGIN_PINCODE,
            delivery_postcode: destinationPincode,
            cod: 0, // 0 for Prepaid, 1 for Cash on Delivery
            weight: PACKAGE_WEIGHT_KG,
            declared_value: DECLARED_VALUE,
            length: PACKAGE_LENGTH_CM,
            breadth: PACKAGE_BREADTH_CM,
            height: PACKAGE_HEIGHT_CM
        }
    };

    try {
        const response = await axios.get(url, config);
        const data = response.data;

        if (data.status === 200 && data.data?.available_courier_companies) {
            return data.data.available_courier_companies;
        } else {
            const errorMessage =
                data.message || "Pincode not serviceable or error occurred.";
            console.log(`   -> Info: ${errorMessage}`);
            return [];
        }
    } catch (error) {
        console.error(
            `   -> ❌ API Request Error for Pincode ${destinationPincode}:`,
            error.message
        );
        return null;
    }
}

/**
 * Main function to read PIN codes from JSON and process them.
 */
async function main() {
    console.log("🚀 Starting Mayavriksh Shipping Rate Checker...");

    const jsonFilePath = "shippingZones.json";
    if (!fs.existsSync(jsonFilePath)) {
        console.error(
            `❌ Error: '${jsonFilePath}' file not found. Please create it first.`
        );
        return;
    }

    // Read and parse the JSON file
    const fileContent = fs.readFileSync(jsonFilePath, "utf8");
    const shippingData = JSON.parse(fileContent);

    // Extract all pincodes from the nested JSON structure
    const destinationPincodes = shippingData.shippingZones.flatMap(district =>
        district.representativePincodes.map(pincodeInfo => pincodeInfo.pincode)
    );

    console.log(
        `\nFound ${destinationPincodes.length} PIN codes to check from warehouse ${ORIGIN_PINCODE}.`
    );
    console.log("-".repeat(60));

    for (const pincode of destinationPincodes) {
        console.log(`📍 Checking Destination Pincode: ${pincode}`);

        const results = await checkShippingRates(pincode);

        if (results && results.length > 0) {
            results.forEach(courier => {
                const rate = parseFloat(courier.rate || 0).toFixed(2);
                const courierName = courier.courier_name || "N/A";
                const etd = courier.etd || "N/A";

                // Using padEnd for clean alignment
                console.log(
                    `   - 🚚 Courier: ${courierName.padEnd(15)} | 💰 Rate: ₹${rate.padEnd(7)} | 📅 ETD: ${etd}`
                );
            });
        }
        console.log("-".repeat(60));
    }

    console.log("✅ All PIN codes checked.");
}

// Run the main function
main();
