const express = require('express');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const path = require('path');

// Local modules
const database = require('./config/database');

// Kết nối DB
database.connectDB();

const app = express();
const port = 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Đặt true nếu dùng HTTPS
}));

// Phải đặt flash middleware sau session và trước các routes
app.use(flash());

// Thêm middleware để truyền flash messages đến views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Routes
const authRoutes = require('./routes/shared/auth.route.js');
const questionRoutes = require('./routes/admin/CRUD_readingTOEIC.route.js');
const clientRoutes = require('./routes/client/index.route');
const adminRoutes = require('./routes/admin/index.route');
const listeningRoutes = require('./routes/admin/CRUD_listeningTOEIC.route.js');
app.use('/auth', authRoutes);
app.use('/', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/questions', questionRoutes);
app.use('/admin/listening', listeningRoutes);
// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});