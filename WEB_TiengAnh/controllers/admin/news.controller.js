const News = require('../../models/TOEIC/news.model');
const mongoose = require('mongoose');

// Thêm hàm validate ID
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

exports.getCreateNews = (req, res) => {
  res.render('admin/pages/news/create-news');
};

exports.postCreateNews = async (req, res) => {
  const { title, image, content, question, options, correctAnswer, author } = req.body;
  await News.create({ title, image, content, question, options, correctAnswer, author });
  res.redirect('/admin/news/list');
};

exports.getNewsList = async (req, res) => {
  const newsList = await News.find().sort({ createdAt: -1 });
  res.render('admin/pages/news/news-list', { newsList });
};

exports.getEditNews = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send('ID không hợp lệ');
  }
  const news = await News.findById(req.params.id);
  if (!news) {
    return res.status(404).send('Bài viết không tồn tại');
  }
  res.render('admin/pages/news/edit-news', { news });
};

exports.postEditNews = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send('ID không hợp lệ');
  }
  const { title, image, content, question, options, correctAnswer, author } = req.body;
  await News.findByIdAndUpdate(req.params.id, { 
    title, 
    image, 
    content, 
    question, 
    options, 
    correctAnswer, 
    author 
  });
  res.redirect('/admin/news/list');
};

exports.deleteNews = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    return res.status(400).send('ID không hợp lệ');
  }
  await News.findByIdAndDelete(req.params.id);
  res.status(200).send();
};