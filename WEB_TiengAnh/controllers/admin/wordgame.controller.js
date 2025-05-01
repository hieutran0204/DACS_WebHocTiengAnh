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
