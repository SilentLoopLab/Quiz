const crypto = require("crypto");
const createHttpError = require("../utils/createHttpError");

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
  const folder = process.env.CLOUDINARY_FOLDER?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw createHttpError(500, "Cloudinary upload is not configured.");
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
    folder,
  };
}

function buildSignature(params, apiSecret) {
  const serializedParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return crypto
    .createHash("sha1")
    .update(`${serializedParams}${apiSecret}`)
    .digest("hex");
}

async function uploadImage(file) {
  if (!file?.buffer?.length) {
    throw createHttpError(400, "At least one image is required.");
  }

  const { cloudName, apiKey, apiSecret, folder } = getCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const signatureParams = {
    folder,
    timestamp,
  };
  const signature = buildSignature(signatureParams, apiSecret);
  const formData = new FormData();

  formData.append(
    "file",
    new Blob([file.buffer], { type: file.mimetype }),
    file.originalname || "image"
  );
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);

  if (folder) {
    formData.append("folder", folder);
  }

  let response;

  try {
    response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });
  } catch (error) {
    throw createHttpError(502, "Cloudinary upload failed.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw createHttpError(502, data?.error?.message || "Cloudinary upload failed.");
  }

  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
    originalName: file.originalname,
  };
}

async function uploadImages(files) {
  if (!Array.isArray(files) || files.length === 0) {
    throw createHttpError(400, "At least one image is required.");
  }

  return Promise.all(files.map((file) => uploadImage(file)));
}

module.exports = {
  uploadImages,
};
