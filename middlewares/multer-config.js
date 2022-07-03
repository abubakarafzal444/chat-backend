const path = require("path");
const multer = require("multer");
const { dirname } = require("path");
const root = dirname(require.main.filename);

//multer configuration
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(root, "..", "src", "util", "images"));
  },
  filename: (req, file, cb) => {
    cb(null, Math.random().toString() + "-" + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimeType == "image/png" ||
    file.mimeType == "image/jpg" ||
    file.mimeType == "image/jpeg"
  ) {
    cb(null, false);
  } else {
    cb(null, true);
  }
};

//multer middleware
const multerMiddleware = multer({
  storage: fileStorage,
  fileFilter: fileFilter,
}).single("image");
module.exports = multerMiddleware;
