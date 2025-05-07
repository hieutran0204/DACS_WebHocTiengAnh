const mongoose = require('mongoose');

const examPartReadingSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true,
    enum: ['Reading'],
    default: 'Reading'
  },
  part: {
    type: [Number], // Lưu danh sách các part (5, 6, 7)
    required: true,
    enum: [5, 6, 7]
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question', // Tham chiếu đến Reading TOEIC questions
      required: true
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  difficulty: {
    type: Number,
    default: 0,
    min: 0,
    max: 2
  },
  status: {
    type: String,
    enum: ['draft', 'public'],
    default: 'draft'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Chỉ mục để tối ưu truy vấn
examPartReadingSchema.index({ examType: 1, part: 1, createdAt: -1 });

module.exports = mongoose.model('ExamPart_Reading', examPartReadingSchema);