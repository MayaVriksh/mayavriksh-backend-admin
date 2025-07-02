const SUCCESS_MESSAGES = require("../constants/successMessages.constant.js");
const ERROR_MESSAGES = require("../constants/errorMessages.constant");
const { getMediaType } = require("./file.utils");
const uploadBufferToCloudinary = require("./mediaUpload.util");

const uploadMedia = async ({ files, folder, publicIdPrefix }) => {
    const isMultiple = Array.isArray(files);

    if (!files || (isMultiple && files.length === 0)) {
        return {
            success: false,
            message: ERROR_MESSAGES.CLOUDINARY.UPLOAD_FAILED
        };
    }

    const fileArray = isMultiple ? files : [files];

    const uploadResults = await Promise.all(
        fileArray.map((file, index) => {
            const mimeType = file.hapi.headers["content-type"];
            const publicId = isMultiple
                ? `${publicIdPrefix}_${index}`
                : publicIdPrefix;

            return uploadBufferToCloudinary(
                file._data,
                folder,
                publicId,
                mimeType
            ).then(res => ({
                ...res,
                mimeType,
                isPrimary: index === 0
            }));
        })
    );

    const failed = uploadResults.find(r => !r.success);
    if (failed) {
        return {
            success: false,
            message: ERROR_MESSAGES.CLOUDINARY.UPLOAD_FAILED,
            error: failed.error
        };
    }

    const data = uploadResults.map(res => ({
        mediaUrl: res.data.url,
        mediaType: getMediaType(res.mimeType),
        publicId: res.data.public_id,
        resourceType: res.data.resource_type,
        isPrimary: res.isPrimary
    }));

    return {
        success: true,
        message: SUCCESS_MESSAGES.CLOUDINARY.UPLOAD_SUCCESS,
        data: isMultiple ? data : data[0]
    };
};

module.exports = uploadMedia;