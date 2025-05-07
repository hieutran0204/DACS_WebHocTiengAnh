const mongoose = require('mongoose');

const speakingSchema = new mongoose.Schema({
  title: String,       // Tiêu đề
  content: String      // Nội dung đoạn văn
}, { timestamps: true });

module.exports = mongoose.model('Speaking', speakingSchema);