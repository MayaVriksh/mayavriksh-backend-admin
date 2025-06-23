const generateFileName = (type, entityId, mimeType) => {
    const extension = mime.extension(mimeType) || "bin";
    const timestamp = Date.now();
    return `${type}_${entityId}_${timestamp}.${extension}`;
};

// will be implemented later
