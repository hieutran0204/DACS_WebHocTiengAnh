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
// Tăng giới hạn kích thước request body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
// // Phục vụ file âm thanh từ shared/audio/listening_TOEIC
// app.use('/audio', express.static('public/shared/audio/listening_TOEIC'));

// // Phục vụ hình ảnh từ shared/images (đã sửa đường dẫn)
// app.use('/images', express.static('public/shared/images'));

app.use('/shared', express.static(path.join(__dirname, 'public/shared')));
app.use('/admin', express.static(path.join(__dirname, 'public/admin')));
app.use('/client', express.static(path.join(__dirname, 'public/client')));

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
// const express = require('express');
// const mongoose = require('mongoose');
// const flash = require('connect-flash');
// const session = require('express-session');
// const cookieParser = require('cookie-parser');
// const methodOverride = require('method-override');
// const path = require('path');
// require('dotenv').config();

// // Module cục bộ
// const database = require('./config/database');

// // Khởi tạo app
// const app = express();
// const port = process.env.PORT || 10000;

// // Tăng giới hạn kích thước request body
// app.use(express.json({ limit: '50mb' }));
// app.use(express.urlencoded({ limit: '50mb', extended: true }));

// // Middleware
// app.use(cookieParser());
// app.use(methodOverride('_method'));

// // Phục vụ static files
// app.use(express.static(path.join(__dirname, 'public')));
// app.use('/shared', express.static(path.join(__dirname, 'public/shared')));

// // Session
// app.use(session({
//   secret: process.env.JWT_SECRET || 'default-secret',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: process.env.NODE_ENV === 'production' }
// }));

// // Flash middleware
// app.use(flash());

// // Truyền flash messages đến views
// app.use((req, res, next) => {
//   res.locals.success = req.flash('success');
//   res.locals.error = req.flash('error');
//   next();
// });

// // Log yêu cầu vào server
// app.use((req, res, next) => {
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   console.log('Body:', req.body);
//   console.log('Files:', req.files);
//   next();
// });

// // Cấu hình view engine
// app.set('view engine', 'pug');
// app.set('views', path.join(__dirname, 'views'));

// // Kết nối DB
// database.connectDB();

// // Routes
// const authRoutes = require('./routes/shared/auth.route.js');
// const questionRoutes = require('./routes/admin/CRUD_readingTOEIC.route.js');
// const clientRoutes = require('./routes/client/index.route');
// const adminRoutes = require('./routes/admin/index.route');
// const listeningRoutes = require('./routes/admin/CRUD_listeningTOEIC.route.js');
// const newsRoutes = require('./routes/client/news.route.js');
// const adminTOEIC = require('./routes/admin/TOEIC.route.js');
// const testTOEIC = require('./routes/client/toeic.route.js');
// const wordGameRoutes = require('./routes/client/wordgame.route.js');
// const wordGameAdminRoutes = require('./routes/admin/wordgame.route.js');
// const hiddenWordAdminRoutes = require('./routes/admin/hiddenWord.route.js');
// const hiddenWordRoutes = require('./routes/client/hiddenWord.route.js');
// const speakingRoutes = require('./routes/client/speaking.route.js');
// const speakingAdminRoutes = require('./routes/admin/speaking.route.js');
// const transcriptionAdminRoutes = require('./routes/admin/transcription.route.js');
// const transcriptionRoutes = require('./routes/client/transcription.route.js');
// const writingAdminRoutes = require('./routes/admin/CRUD_writingTOEIC.route.js');
// const manageUserRoutes = require('./routes/admin/users.route.js');

// app.use('/auth', authRoutes);
// app.use('/', authRoutes);
// app.use('/', clientRoutes);
// app.use('/admin', adminRoutes);
// app.use('/admin/questions', questionRoutes);
// app.use('/admin/listeningTOEIC', listeningRoutes);
// app.use('/news', newsRoutes);
// app.use('/admin/TOEIC', adminTOEIC);
// app.use('/testtoeic', testTOEIC);
// app.use('/wordgame', wordGameRoutes);
// app.use('/admin/wordgame', wordGameAdminRoutes);
// app.use('/admin/hidden-word', hiddenWordAdminRoutes);
// app.use('/hidden-word', hiddenWordRoutes);
// app.use('/speaking', speakingRoutes);
// app.use('/admin/speaking', speakingAdminRoutes);
// app.use('/admin/transcription', transcriptionAdminRoutes);
// app.use('/transcription', transcriptionRoutes);
// app.use('/admin/toeic-writing', writingAdminRoutes);
// app.use('/admin/users', manageUserRoutes);

// // Xử lý lỗi 404
// app.use((req, res, next) => {
//   res.status(404).render('404', { title: '404 - Không tìm thấy trang' });
// });

// // Xử lý lỗi server
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
// //   res.status(500).render('500', { title: '500 - Lỗi server', error: err.message });
// });

// // Khởi động server
// const server = app.listen(port, () => {
// //   console.log(`Server đang chạy tại http://localhost:${port}`);
// });

// // Tăng thời gian timeout
// server.setTimeout(300000); // 5 phút