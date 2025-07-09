const fs = require("fs").promises;
const path = require("path");
const mime = require("mime-types");
const { uploadToCloudinary } = require("./cloudinaryUploader");
const { getCloudinaryTransformation } = require("../utils/file.utils");
const ERROR_MESSAGES = require("../constants/errorMessages.constant");
const { RESPONSE_FLAGS } = require("../constants/responseCodes.constant");

const saveTempFile = async (
    buffer,
    prefix = "upload",
    mimeType = "application/octet-stream"
) => {
    const extension = mime.extension(mimeType) || "bin";
    const fileName = `${prefix}_${Date.now()}.${extension}`;
    const filePath = path.join(__dirname, `../../uploads/${fileName}`);
    await fs.writeFile(filePath, buffer);
    return filePath;
};

const uploadBufferToCloudinary = async (
    buffer,
    folder,
    prefix = "media",
    mimeType = "application/octet-stream"
) => {
    if (!buffer || !Buffer.isBuffer(buffer)) {
        return {
            success: RESPONSE_FLAGS.FAILURE,
            error: ERROR_MESSAGES.CLOUDINARY.INVALID_FILE_PATH
        };
    }

    let tempPath;

    try {
        // Save file to temp disk location
        tempPath = await saveTempFile(buffer, prefix, mimeType);
        console.log(tempPath)
        // Get optimized Cloudinary resource type and transformation
        const { resourceType, transformation } =
            getCloudinaryTransformation(mimeType);

        // Upload with optimized options
        const response = await uploadToCloudinary(
            tempPath,
            folder,
            resourceType,
            transformation
        );

        // Cleanup handled inside `uploadToCloudinary`, but you may do extra check if needed
        return response;
    } catch (err) {
        console.log(err)
        // Attempt cleanup
        if (tempPath) {
            try {
                await fs.unlink(tempPath);
            } catch (cleanupErr) {
                console.warn("Temp file cleanup failed:", cleanupErr.message);
            }
        }

        return {
            success: RESPONSE_FLAGS.FAILURE,
            error: `${ERROR_MESSAGES.CLOUDINARY.UPLOAD_FAILED} (${err.message})`
        };
    }
};

module.exports = uploadBufferToCloudinary;
