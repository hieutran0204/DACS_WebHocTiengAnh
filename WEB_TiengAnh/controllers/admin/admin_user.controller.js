const User = require('../../models/shared/user.model');

// Hiển thị danh sách người dùng
exports.getUserList = async (req, res) => {
  try {
    const users = await User.find().select('username email role createdAt');
    res.render('admin/pages/users/list', {
      users,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    req.flash('error', 'Không thể tải danh sách người dùng');
    res.render('admin/pages/users/list', { users: [], success: req.flash('success'), error: req.flash('error') });
  }
};

// Hiển thị form tạo người dùng
exports.showCreateForm = (req, res) => {
  res.render('admin/pages/users/create', { success: req.flash('success'), error: req.flash('error') });
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !password || !role) {
      req.flash('error', 'Vui lòng điền đầy đủ thông tin');
      return res.redirect('/admin/users/create');
    }

    // Kiểm tra username và email đã tồn tại
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      req.flash('error', 'Username hoặc email đã tồn tại');
      return res.redirect('/admin/users/create');
    }

    // Tạo người dùng mới
    const user = new User({ username, email, password, role });
    await user.save();

    req.flash('success', 'Tạo người dùng thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Lỗi khi tạo người dùng:', error);
    req.flash('error', 'Lỗi khi tạo người dùng');
    res.redirect('/admin/users/create');
  }
};

// Hiển thị form sửa người dùng
exports.showEditForm = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('username email role');
    if (!user) {
      req.flash('error', 'Không tìm thấy người dùng');
      return res.redirect('/admin/users');
    }
    res.render('admin/pages/users/edit', { user, success: req.flash('success'), error: req.flash('error') });
  } catch (error) {
    console.error('Lỗi khi tải form sửa:', error);
    req.flash('error', 'Lỗi khi tải form sửa');
    res.redirect('/admin/users');
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const userId = req.params.id;

    // Kiểm tra dữ liệu đầu vào
    if (!username || !email || !role) {
      req.flash('error', 'Vui lòng điền đầy đủ thông tin');
      return res.redirect(`/admin/users/edit/${userId}`);
    }

    // Kiểm tra username và email đã tồn tại (trừ user hiện tại)
    const existingUser = await User.findOne({
      $or: [{ username }, { email }],
      _id: { $ne: userId }
    });
    if (existingUser) {
      req.flash('error', 'Username hoặc email đã tồn tại');
      return res.redirect(`/admin/users/edit/${userId}`);
    }

    // Cập nhật người dùng
    await User.findByIdAndUpdate(userId, { username, email, role }, { new: true });

    req.flash('success', 'Cập nhật người dùng thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error);
    req.flash('error', 'Lỗi khi cập nhật người dùng');
    res.redirect(`/admin/users/edit/${req.params.id}`);
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Không cho phép xóa admin chính (giả định admin đầu tiên)
    const user = await User.findById(userId);
    if (!user) {
      req.flash('error', 'Không tìm thấy người dùng');
      return res.redirect('/admin/users');
    }
    if (user.role === 'admin' && (await User.countDocuments({ role: 'admin' })) === 1) {
      req.flash('error', 'Không thể xóa admin duy nhất');
      return res.redirect('/admin/users');
    }

    await User.findByIdAndDelete(userId);

    req.flash('success', 'Xóa người dùng thành công');
    res.redirect('/admin/users');
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    req.flash('error', 'Lỗi khi xóa người dùng');
    res.redirect('/admin/users');
  }
};