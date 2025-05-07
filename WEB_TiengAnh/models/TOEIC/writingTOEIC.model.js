const mongoose = require('mongoose');

const part1Schema = new mongoose.Schema({
  keyword1: String,
  keyword2: String,
  imagePath: String
});

const part2Schema = new mongoose.Schema({
  situation: String,
  requirements: String,
  sampleAnswer: String
});

const part3Schema = new mongoose.Schema({
  question: String,
  sampleAnswer: String
});

const writingTOEICSchema = new mongoose.Schema({
    part1: [part1Schema],  // Mảng câu hỏi Part 1
    part2: [part2Schema],  // Mảng câu hỏi Part 2
    part3: [part3Schema],  // Mảng câu hỏi Part 3
    notes: String,
    createdAt: { type: Date, default: Date.now } // Thêm trường thời gian tạo
});

module.exports = mongoose.model('WritingTOEIC', writingTOEICSchema);
