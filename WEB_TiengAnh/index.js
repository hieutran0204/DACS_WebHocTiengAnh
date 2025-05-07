const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');
require('dotenv').config();

// Module cục bộ
const database = require('./config/database');

// Khởi tạo app trước
const app = express();
const port = process.env.PORT || 10000; // Dự phòng port 10000 nếu không có trong .env

// Middleware để xử lý _method
app.use(methodOverride('_method'));

// Kết nối DB
database.connectDB();

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
const newsRoutes = require('./routes/client/news.route.js');
const adminTOEIC = require('./routes/admin/TOEIC.route.js');
const testTOEIC = require('./routes/client/toeic.route.js');
const wordGameRoutes = require('./routes/client/wordgame.route.js');
const wordGameAdminRoutes = require('./routes/admin/wordgame.route.js'); 
const hiddenWordAdminRoutes = require('./routes/admin/hiddenWord.route.js'); 
const hiddenWordRoutes = require('./routes/client/hiddenWord.route.js'); 
const speakingRoutes = require('./routes/client/speaking.route.js');
const speakingAdminRoutes = require('./routes/admin/speaking.route.js');
const transcriptionAdminRoutes = require('./routes/admin/transcription.route.js');
const transcriptionRoutes = require('./routes/client/transcription.route.js');
const writingAdminRoutes = require('./routes/admin/CRUD_writingTOEIC.route.js'); // Thêm route Writing
const manageUserRoutes = require('./routes/admin/users.route.js'); // Thêm route quản lý người dùng
app.use('/auth', authRoutes);
app.use('/', authRoutes);
app.use('/', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/questions', questionRoutes);
app.use('/admin/listeningTOEIC', listeningRoutes);
app.use('/news', newsRoutes);
app.use('/admin/TOEIC', adminTOEIC);
app.use('/testtoeic', testTOEIC);
app.use('/wordgame', wordGameRoutes);
app.use('/admin/wordgame', wordGameAdminRoutes); 
app.use('/admin/hidden-word', hiddenWordAdminRoutes); 
app.use('/hidden-word', hiddenWordRoutes); 
app.use('/speaking', speakingRoutes);
app.use('/admin/speaking', speakingAdminRoutes);
app.use('/admin/transcription', transcriptionAdminRoutes);
app.use('/transcription', transcriptionRoutes);
app.use('/admin/toeic-writing', writingAdminRoutes); // Thêm route Writing
app.use('/admin/users', manageUserRoutes); // Thêm route quản lý người dùng
// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});