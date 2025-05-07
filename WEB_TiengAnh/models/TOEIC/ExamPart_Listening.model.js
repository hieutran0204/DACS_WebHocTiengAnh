const mongoose = require('mongoose');

const examPartListeningSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: true,
    enum: ['Listening'],
    default: 'Listening'
  },
  part: {
    type: [Number], // Lưu danh sách các part (1, 2, 3, 4)
    required: true,
    enum: [1, 2, 3, 4]
  },
  questions: [{
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'questions.modelName' // Tham chiếu động đến ListeningTOEICPartX
    },
    modelName: {
      type: String,
      required: true,
      enum: ['ListeningTOEICPart1', 'ListeningTOEICPart2', 'ListeningTOEICPart3', 'ListeningTOEICPart4']
    },
    subQuestionIndex: {
      type: Number, // Chỉ dùng cho Part 3, 4
      required: false,
      min: 0
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
examPartListeningSchema.index({ examType: 1, part: 1, createdAt: -1 });

module.exports = mongoose.model('ExamPart_Listening', examPartListeningSchema);