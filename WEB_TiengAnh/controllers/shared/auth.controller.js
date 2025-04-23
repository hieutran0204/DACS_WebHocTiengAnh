const User = require('../../models/shared/user.model');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');

// Render trang đăng ký (GET)
exports.showRegister = (req, res) => {
  res.render('client/pages/register'); // Render file signup.pug
};

// Xử lý đăng ký (POST)
exports.register = async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    
    // Đăng ký thành công -> chuyển hướng đến trang login
    res.redirect('login');
  } catch (error) {
    // Render lại trang đăng ký với thông báo lỗi
    res.render('client/pages/register', { error: 'Đăng ký thất bại: ' + error.message });
  }
};

// Render trang đăng nhập (GET)
exports.showLogin = (req, res) => {
  res.render('client/pages/login'); // Render file login.pug
};

// Xử lý đăng nhập (POST)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user || !(await user.comparePassword(password))) {
      return res.render('client/pages/login', { error: 'Email hoặc mật khẩu không đúng' });
    }

    // Tạo token và lưu vào cookie
    const token = jwt.sign({ id: user._id }, config.jwt.secret, { expiresIn: '1h' });
    res.cookie('token', token, { httpOnly: true });
    
    // Chuyển hướng sau khi đăng nhập thành công
    res.redirect('/home');
  } catch (error) {
    res.render('client/pages/login', { error: 'Lỗi hệ thống: ' + error.message });
  }
};



//Logout controller
exports.logout = (req, res) => {
  // Xóa cookie token
  res.clearCookie('token', {
    httpOnly: true,
    // Thêm các options giống khi bạn set cookie
    // secure: true, // Nếu dùng HTTPS
    // sameSite: 'strict'
  });
  
  // Thêm header để ngăn cache trình duyệt
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  // Chuyển hướng đến trang login
  res.redirect('/login');
}
exports.showLogout = (req, res) => {
  res.render('client/pages/login'); // Render file login.pug
};