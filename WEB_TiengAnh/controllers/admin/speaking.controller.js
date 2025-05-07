const Speaking = require('../../models/TOEIC/speaking.model');
// Hiển thị form tạo mới
exports.createForm = (req, res) => {
  res.render('admin/pages/TOEIC/speaking-create');
};

// Xử lý tạo mới
exports.create = async (req, res) => {
  const { title, content } = req.body;
  await Speaking.create({ title, content }); // Tạo mới trong DB
  res.redirect('/admin/speaking'); // Quay lại danh sách
};
// Hiển thị danh sách
exports.list = async (req, res) => {
  const speeches = await Speaking.find();
  res.render('admin/pages/TOEIC/speaking-list', { speeches });
};

// Xóa
exports.delete = async (req, res) => {
  await Speaking.findByIdAndDelete(req.params.id);
  res.redirect('/admin/speaking');
};