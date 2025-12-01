const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Upload folder
const uploadPath = path.join(__dirname, "../../public/uploads");
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if ([".jpg", ".jpeg", ".png", ".webp"].includes(ext)) cb(null, true);
  else cb(new Error("Only images are allowed"), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
