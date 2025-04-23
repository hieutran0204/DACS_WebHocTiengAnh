const express = require('express');
const mongoose = require('mongoose');
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

// View engine setup
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
// app.set('views', './views');
// Routes
const authRoutes = require('./routes/shared/auth.route.js');
const questionRoutes = require('./routes/admin/CRUD_readingTOEIC.route.js');
const clientRoutes = require('./routes/client/index.route');
const adminRoutes = require('./routes/admin/index.route');

app.use('/auth', authRoutes);
app.use('/', authRoutes);
app.use('/', clientRoutes);
app.use('/admin', adminRoutes);
app.use('/admin/questions', questionRoutes); // Nên đặt cùng nhóm admin

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy tại http://localhost:${port}`);
});