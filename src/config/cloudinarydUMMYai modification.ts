// const completeSupplierProfile = async (req, h) => {
//     try {
//         const { userId, tradeLicenseImage, tradeLicenseUrl } = req.pre.credentials;
//         const payload = req.payload;
//         console.log(tradeLicenseImage,tradeLicenseUrl)
//         console.log(payload)
//         // --- MODIFIED: Simplified and Corrected Validation ---
//         // 1. Define only the fields required for THIS specific form.
//         // We no longer check for 'phoneNumber' here.
//         const requiredTextFields = [
//             'nurseryName', 'streetAddress', 'city', 'state',
//             'country', 'pinCode', 'gstin', 'businessCategory', 'warehouseId'
//         ];

//         // 2. Validate that all required text fields were sent from the frontend.
//         for (const field of requiredTextFields) {
//             if (!payload[field]) {
//                 return h.response({ message: `Missing required field: ${field}` }).code(400).takeover();
//             }
//         }

//         // 3. Validate that the required file was uploaded.
//         if (!payload.tradeLicenseImage) {
//             return h.response({ message: "Trade license image is required." }).code(400).takeover();
//         }
//         // --- MODIFIED: Streamlined File Upload Logic ---

//         // Use a helper function for clarity to upload a single file.
//         const uploadFile = async (fileStream, folder, fileName) => {
//             const mimeType = fileStream.hapi.headers["content-type"];

//             // --- MODIFIED: Use the helper to get the full data buffer ---
//             const buffer = await streamToBuffer(fileStream);

//             // Now we pass the complete, reliable buffer to Cloudinary
//             const uploadResult = await uploadBufferToCloudinary(buffer, mimeType, folder, fileName);
//             return uploadResult;
//         };

//         // Upload the trade license.
//         const licenseUploadResult = await uploadFile(payload.tradeLicenseImage, "suppliers/trade_licenses", `trade_license_${userId}`);

//          const nurseryImageFiles = Array.isArray(payload.nurseryImages) ? payload.nurseryImages : [payload.nurseryImages].filter(Boolean);

//        const mediaAssets = await Promise.all(
//             nurseryImageFiles.map(async (imageFile, index) => {
//                 const uploadResult = await uploadFile(imageFile, "suppliers/nursery_assets", `nursery_${userId}_${index}`);
//                 return {
//                     mediaUrl: uploadResult.secure_url,
//                     publicId: uploadResult.public_id,
//                     mediaType: getMediaType(imageFile.hapi.headers['content-type']),
//                     isPrimary: index === 0,
//                 };
//             })
//         );

//         // Prepare data for the service layer
//         const profileData = {
//             nurseryName: payload.nurseryName,
//             streetAddress: payload.streetAddress,
//             landmark: payload.landmark || '',
//             city: payload.city,
//             state: payload.state,
//             country: payload.country,
//             pinCode: payload.pinCode,
//             gstin: payload.gstin,
//             businessCategory: payload.businessCategory,
//             warehouseId: payload.warehouseId,
//             tradeLicenseUrl: licenseUploadResult.secure_url
//         };

//         const result = await SupplierService.completeSupplierProfile(userId, profileData, mediaAssets);

//         return h.response(result).code(result.code);

//     } catch (error) {
//         console.error("Supplier Profile Completion Error:", error.message);
//         return h.response({
//             success: false,
//             message: error.message || "An internal error occurred during profile completion."
//         }).code(500);
//     }
// };
