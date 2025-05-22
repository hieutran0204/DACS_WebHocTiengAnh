// uploadWriting.middleware.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/shared/images/writing_TOEIC");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "-");
    const ext = path.extname(cleanFileName).toLowerCase();
    cb(null, `writing-${req.body.part || "unknown"}-${uniqueSuffix}${ext}`);
  },
});

// Bộ lọc tệp
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif)"), false);
  }
};

// Khởi tạo middleware upload
const uploadWriting = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
  fileFilter: fileFilter,
}).single("image"); // Sửa thành .single("image") để khớp với tên trường trong form

// Middleware xử lý lỗi upload
const handleWritingError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    req.flash("error", `Lỗi upload: ${err.message}`);
  } else if (err) {
    req.flash("error", `Lỗi: ${err.message}`);
  }

  const originalUrl = req.originalUrl;
  if (originalUrl.includes("/add")) {
    return res.redirect("/admin/toeic-writing/create");
  } else if (originalUrl.includes("/update")) {
    return res.redirect(`/admin/toeic-writing/edit/${req.params.id}`);
  } else if (originalUrl.includes("/exams/add")) {
    return res.redirect("/admin/toeic-writing/exams/create");
  }

  next();
};

module.exports = { uploadWriting, handleWritingError };