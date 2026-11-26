const multer = require("multer");
const path = require("path");

const extensionsByMimeType = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"]
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (req, file, callback) => {
    const extensions = extensionsByMimeType[file.mimetype];
    const extension = path.extname(file.originalname).toLowerCase();

    if (!extensions || !extensions.includes(extension)) {
      return callback(new Error("Formats acceptés : JPG, PNG ou WEBP"));
    }

    callback(null, true);
  }
}).single("image");

const signatureMatches = (file) => {
  const buffer = file.buffer;
  if (file.mimetype === "image/png") {
    return buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  }
  if (file.mimetype === "image/jpeg") {
    return buffer.length >= 3 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  }
  if (file.mimetype === "image/webp") {
    return buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP";
  }
  return false;
};

module.exports = (req, res, next) => {
  upload(req, res, (error) => {
    if (!error) {
      if (req.file && (!req.file.size || !signatureMatches(req.file))) {
        return res.status(400).json({ message: "Le fichier ne contient pas une image valide" });
      }
      return next();
    }

    if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "La photo ne peut pas dépasser 5 Mo" });
    }

    return res.status(400).json({
      message: error.message || "La photo n'a pas pu être importée"
    });
  });
};
