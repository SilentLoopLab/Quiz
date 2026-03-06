const fs = require("fs/promises");
const path = require("path");

async function writeJsonFile(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

async function readJsonFile(filePath, fallbackValue) {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    if (!content.trim()) {
      return fallbackValue;
    }

    return JSON.parse(content);
  } catch (error) {
    if (error.code === "ENOENT" && fallbackValue !== undefined) {
      await writeJsonFile(filePath, fallbackValue);
      return fallbackValue;
    }

    if (error.name === "SyntaxError") {
      const invalidJsonError = new Error(`Invalid JSON format in ${filePath}`);
      invalidJsonError.cause = error;
      throw invalidJsonError;
    }

    throw error;
  }
}

module.exports = {
  readJsonFile,
  writeJsonFile,
};
