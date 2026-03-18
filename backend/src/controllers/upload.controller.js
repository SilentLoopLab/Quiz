const { uploadImages } = require("../services/upload.service");

async function images(req, res, next) {
    try {
        const files = [
            ...(req.files?.image || []),
            ...(req.files?.images || []),
        ];
        const uploadedFiles = await uploadImages(files);

        return res.status(201).json({
            url: uploadedFiles[0]?.url || null,
            files: uploadedFiles,
        });
    } catch (error) {
        return next(error);
    }
}

async function photos(req, res, next) {
    try {
        const files = [
            ...(req.files?.image || []),
            ...(req.files?.images || []),
        ];
        const uploadedFiles = await uploadImages(files);

        return res.status(201).json({
            url: uploadedFiles[0]?.url || null,
            files: uploadedFiles,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    images,
    photos,
};
