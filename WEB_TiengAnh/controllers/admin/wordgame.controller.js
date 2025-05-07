const WordGame = require('../../models/TOEIC/wordgame.model');

exports.createWord = async (req, res) => {
  const { word, hint } = req.body;
  await WordGame.create({ word, hint });
  res.redirect('/admin/wordgame/create');
};

exports.viewWords = async (req, res) => {
  const words = await WordGame.find().lean();
  res.render('admin/pages/wordgame-manage', { words });
};

exports.deleteWord = async (req, res) => {
  const { id } = req.params;
  await WordGame.findByIdAndDelete(id);
  res.redirect('/admin/wordgame/create');
};
// Hiển thị form chỉnh sửa
exports.editWord = async (req, res) => {
  const { id } = req.params;
  const word = await WordGame.findById(id).lean();
  res.render('admin/pages/wordgame-edit', { word });
};

// Xử lý cập nhật từ
exports.updateWord = async (req, res) => {
  const { id } = req.params;
  const { word, hint } = req.body;
  await WordGame.findByIdAndUpdate(id, { word, hint });
  res.redirect('/admin/wordgame/create');
};
