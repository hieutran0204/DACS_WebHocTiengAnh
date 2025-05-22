const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, 'Họ và tên là bắt buộc'],
    trim: true,
    minlength: [5, 'Họ và tên phải có ít nhất 5 ký tự'],
    maxlength: [30, 'Họ và tên không được vượt quá 30 ký tự']
  },
  phonenumber: {
    type: String,
    required: [true, 'Số điện thoại là bắt buộc'],
    trim: true,
    match: [/^\d{10,15}$/, 'Số điện thoại không hợp lệ (phải có 10-15 chữ số)']
  },
  email: {
    type: String,
    required: [true, 'Email là bắt buộc'],
    unique: true,
    trim: true,
    match: [/.+\@.+\..+/, 'Email không hợp lệ'],
    minlength: [8, 'Email phải có ít nhất 8 ký tự'],
    maxlength: [24, 'Email không được vượt quá 24 ký tự']
  },
  age: {
    type: String,
    required: [true, 'Tuổi là bắt buộc'],
    enum: {
      values: ['u18', 'f18t39', 'f40t64', 'o65'],
      message: 'Độ tuổi không hợp lệ'
    }
  },
  username: {
    type: String,
    required: [true, 'Tên người dùng là bắt buộc'],
    unique: true,
    trim: true,
    minlength: [6, 'Tên người dùng phải có ít nhất 6 ký tự'],
    maxlength: [12, 'Tên người dùng không được vượt quá 12 ký tự']
  },
  password: {
    type: String,
    required: [true, 'Mật khẩu là bắt buộc'],
    minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
    maxlength: [24, 'Mật khẩu không được vượt quá 24 ký tự']
  },
  sex: {
    type: String,
    required: [true, 'Giới tính là bắt buộc'],
    enum: {
      values: ['male', 'female', 'another'],
      message: 'Giới tính không hợp lệ'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  refreshToken: {
    type: String
  }
}, { timestamps: true });

// Hash password trước khi lưu
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// So sánh password
userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);