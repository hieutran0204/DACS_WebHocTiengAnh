const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

// Module cục bộ
const database = require('./config/database');

// Kết nối DB
database.connectDB();

const app = express();
const port = process.env.PORT || 10000; // Dự phòng port 10000 nếu không có trong .env

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
// Phục vụ file âm thanh từ shared/audio/listening_TOEIC
app.use('/audio', express.static('public/shared/audio/listening_TOEIC'));

// Phục vụ hình ảnh từ shared/images (đã sửa đường dẫn)
app.use('/images', express.static('public/shared/images'));

// Sử dụng JWT_SECRET từ .env
app.use(session({
    secret: process.env.JWT_SECRET || 'default-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Đặt flash middleware sau session và trước routes
app.use(flash());

// Truyền flash messages đến views
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Cấu hình view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/shared/auth.route.js');
const questionRoutes = require('./routes/admin/CRUD_readingTOEIC.route.js');
const clientRoutes = require('./routes/client/index.route');
const adminRoutes = require('./routes/admin/index.route');
const listeningRoutes = require('./routes/admin/CRUD_listeningTOEIC.route.js');
const examRoutes = require('./routes/admin/CRUD_TOEIC_Part.route.js');
app.use('/auth', authRoutes);
app.use('/', authRoutes);
app.use('/', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/questions', questionRoutes);
app.use('/admin/listeningTOEIC', listeningRoutes);
app.use('/admin/exam', examRoutes);

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});