import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./public/data/uploads");
  },
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    callback(null, file.originalname + "-" + uniqueSuffix);
  },
});

export const upload = multer({ storage });
