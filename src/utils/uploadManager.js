const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadToCloudinary } = require("./cloudinaryUploader");

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);
        const finalName = `${baseName}-${Date.now()}${ext}`;
        cb(null, finalName);
    }
});

const upload = multer({ storage });

const uploadMultipleImagesToCloudinary = async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: "No files uploaded" });
        }

        const uploadResults = [];

        for (const file of req.files) {
            const result = await uploadToCloudinary(file.path, "plants");
            if (!result.success) {
                // Optionally delete successful uploads so far (rollback)
                return res.status(500).json({ error: result.error });
            }
            uploadResults.push(result);
        }

        // Attach results to request
        req.cloudinaryUploads = uploadResults;
        next();
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    upload, // for .single
    uploadMultiple: upload.array("images", 10), // max 10 files
    uploadMultipleImagesToCloudinary
};
