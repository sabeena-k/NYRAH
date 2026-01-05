import multer from "multer";
import path from "path";
import fs from "fs";

const uploadPath = path.join(process.cwd(), "public/uploads/categoryImages");
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadPath),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = ["image/jpeg","image/png","image/jpg","image/webp"].includes(file.mimetype);

  if (ext && mime) cb(null, true);
  else cb(new Error("Only images allowed"));
};

export const categoryUpload = multer({ storage, fileFilter });
