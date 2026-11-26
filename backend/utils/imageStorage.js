const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");

const dossierImages = path.join(__dirname, "..", "uploads");

const extensionsByMimeType = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp"
};

exports.saveImage = async (file) => {
  const extension = extensionsByMimeType[file.mimetype];
  if (!extension) {
    throw Object.assign(new Error("Format de photo non accepté"), { statusCode: 400 });
  }

  const nomFichier = `${randomUUID()}${extension}`;
  await fs.mkdir(dossierImages, { recursive: true });
  await fs.writeFile(path.join(dossierImages, nomFichier), file.buffer, { flag: "wx" });
  return `/uploads/${nomFichier}`;
};
