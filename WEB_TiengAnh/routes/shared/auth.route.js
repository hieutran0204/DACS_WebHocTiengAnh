const express = require('express');
const router = express.Router();
const authController = require('../../controllers/shared/auth.controller');
const { verifyToken, isAdmin, noCache } = require('../../middlewares/auth.middleware');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const User = require('../../models/shared/user.model');

// Middleware để kiểm tra trạng thái đăng nhập và thêm vào res.locals
const checkAuth = async (req, res, next) => {
  const token = req.cookies.token;
  let isLoggedIn = false;
  let userName = null;

  if (token) {
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await User.findById(decoded.id);
      if (user) {
        isLoggedIn = true;
        userName = user.username || 'User'; // Lấy username từ model
        req.user = user; // Lưu user vào req để sử dụng trong các route
      }
    } catch (error) {
      console.log('Invalid token:', error.message);
    }
  }

  // Gán vào res.locals để truyền vào template
  res.locals.isLoggedIn = isLoggedIn;
  res.locals.userName = userName;
  next();
};

// Áp dụng middleware checkAuth cho tất cả các route
router.use(checkAuth);

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

// Dashboard cho người dùng thường
router.get('/dashboard', noCache, verifyToken, (req, res) => {
  res.render('client/pages/dashboard', { user: req.user });
});

// Dashboard cho admin
router.get('/admin', verifyToken, isAdmin, (req, res) => {
  res.render('admin/pages/dashboard', { user: req.user });
});

router.get('/profile', noCache, verifyToken, (req, res) => {
  res.render('client/pages/profile', { user: req.user });
});


// Trang profile
router.get('/profile', noCache, verifyToken, (req, res) => {
  res.render('client/pages/profile', { user: req.user });
});

// Xử lý thay đổi mật khẩu
router.post('/profile/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Kiểm tra mật khẩu hiện tại
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.render('client/pages/profile', {
        user: req.user,
        error: 'Mật khẩu hiện tại không đúng',
        activeTab: 'change-password'
      });
    }

    // Kiểm tra mật khẩu mới và xác nhận
    if (newPassword !== confirmNewPassword) {
      return res.render('client/pages/profile', {
        user: req.user,
        error: 'Mật khẩu mới và xác nhận không khớp',
        activeTab: 'change-password'
      });
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    res.render('client/pages/profile', {
      user: req.user,
      success: 'Thay đổi mật khẩu thành công',
      activeTab: 'change-password'
    });
  } catch (error) {
    res.render('client/pages/profile', {
      user: req.user,
      error: 'Lỗi hệ thống: ' + error.message,
      activeTab: 'change-password'
    });
  }
});

// Xử lý thay đổi email
router.post('/profile/change-email', verifyToken, async (req, res) => {
  try {
    const { newEmail, confirmEmail } = req.body;
    const user = await User.findById(req.user._id);

    // Kiểm tra email mới và xác nhận
    if (newEmail !== confirmEmail) {
      return res.render('client/pages/profile', {
        user: req.user,
        error: 'Email mới và xác nhận không khớp',
        activeTab: 'change-email'
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.render('client/pages/profile', {
        user: req.user,
        error: 'Email đã được sử dụng',
        activeTab: 'change-email'
      });
    }

    // Cập nhật email mới
    user.email = newEmail;
    await user.save();

    res.render('client/pages/profile', {
      user: user,
      success: 'Thay đổi email thành công',
      activeTab: 'change-email'
    });
  } catch (error) {
    res.render('client/pages/profile', {
      user: req.user,
      error: 'Lỗi hệ thống: ' + error.message,
      activeTab: 'change-email'
    });
  }
});

module.exports = router;