const express = require('express');
const router = express.Router();
const authController = require('../../controllers/shared/auth.controller');
const { verifyToken, isAdmin, noCache } = require('../../middlewares/auth.middleware');

// Đăng ký
router.get('/register', authController.showRegister);
router.post('/register', authController.register);

// Đăng nhập
router.get('/login', authController.showLogin);
router.post('/login', authController.login);

// Trang chủ sau khi đăng nhập
router.get('/home', noCache, verifyToken, (req, res) => {
  res.render('client/pages/home', { user: req.user });
});

// Đăng xuất
router.get('/logout', noCache, (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.redirect('/login');
});

// Dashboard cho người dùng thường (nếu vẫn cần)
router.get('/dashboard', noCache, verifyToken, (req, res) => {
  res.render('client/pages/dashboard', { user: req.user });
});

// Dashboard cho admin
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.render('admin/pages/dashboard', { user: req.user });
});

module.exports = router;
