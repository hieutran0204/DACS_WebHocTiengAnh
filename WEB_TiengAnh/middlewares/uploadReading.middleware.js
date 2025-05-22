const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình lưu trữ
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../public/shared/images/reading_TOEIC');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Loại bỏ ký tự đặc biệt trong tên tệp gốc
        const cleanFileName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '');
        const ext = path.extname(cleanFileName).toLowerCase();
        cb(null, `reading-image-${uniqueSuffix}${ext}`);
    }
});

// Bộ lọc tệp
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ chấp nhận file hình ảnh (jpg, jpeg, png, gif)'), false);
    }
};

// Khởi tạo middleware upload
const uploadReading = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB
    fileFilter: fileFilter
});

// Middleware xử lý lỗi upload
const handleReadingError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        req.flash('error', `Lỗi upload: ${err.message}`);
        return res.redirect('/admin/questions/add');
    } else if (err) {
        req.flash('error', `Lỗi: ${err.message}`);
        return res.redirect('/admin/questions/add');
    }
    next();
};

module.exports = { uploadReading, handleReadingError };