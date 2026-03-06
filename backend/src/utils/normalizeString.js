function normalizeString(value) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

module.exports = normalizeString;
