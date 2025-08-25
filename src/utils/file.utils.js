const ffmpeg = require("fluent-ffmpeg");

const getMediaType = (mimeType) => {
    if (!mimeType || typeof mimeType !== "string") return "FILE";
    if (mimeType.startsWith("image/")) return "IMAGE";
    if (mimeType.startsWith("video/")) return "VIDEO";
    if (mimeType.startsWith("audio/")) return "AUDIO";
    if (mimeType.startsWith("application/")) return "FILE";
    if (mimeType.startsWith("text/")) return "FILE";
    return "FILE";
};

const getCloudinaryTransformation = (mimeType, durationInSec = null) => {
    const resourceType = getCloudinaryResourceType(mimeType);

    switch (resourceType) {
        case "image":
            return {
                resourceType: "image",
                transformation: [
                    { width: 1200, crop: "limit" },
                    { quality: "auto:best" },
                    { fetch_format: "avif" }
                ]
            };
        case "video":
            const isShort = durationInSec !== null ? durationInSec <= 60 : true;
            return {
                resourceType: "video",
                transformation: [
                    { width: 1080, crop: "limit" },
                    { quality: "auto:best" },
                    { fetch_format: isShort ? "webm" : "mp4" }
                ]
            };
        case "raw":
            return {
                resourceType: "raw",
                transformation: null
            };
        default:
            return {
                resourceType: "auto",
                transformation: null
            };
    }
};

const getCloudinaryResourceType = (mimeType) => {
    if (!mimeType) return "auto";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";

    const rawMimeTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-powerpoint",
        "application/zip"
    ];

    if (rawMimeTypes.includes(mimeType)) return "raw";
    return "auto";
};

const getVideoDurationInSec = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) return reject(err);
            resolve(metadata.format.duration || 0);
        });
    });
};

module.exports = {
    getMediaType,
    getCloudinaryTransformation,
    getCloudinaryResourceType,
    getVideoDurationInSec
};
