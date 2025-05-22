// models/Submission.js
const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true // Yêu cầu client đăng nhập
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WritingTOEIC',
    required: true
  },
  answers: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WritingQuestion'
    },
    answer: {
      type: String,
      required: true
    }
  }],
  submittedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Submission', submissionSchema);