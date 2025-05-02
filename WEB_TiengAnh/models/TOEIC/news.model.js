const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: String,
  image: String, // URL hoặc đường dẫn upload
  content: String,
  question: String,
  options: [String],
  correctAnswer: Number,
  createdAt: { type: Date, default: Date.now },
  author: String
});

module.exports = mongoose.model('News', newsSchema);
