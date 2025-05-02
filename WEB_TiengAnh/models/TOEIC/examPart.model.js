const mongoose = require('mongoose');

const examPartSchema = new mongoose.Schema({
  examType: {
    type: String,
    required: [true, 'Loại đề thi là bắt buộc'],
    enum: {
      values: ['Listening', 'Reading'],
      message: 'Loại đề thi phải là Listening hoặc Reading',
    },
  },
  part: {
    type: Number,
    required: [true, 'Phần thi là bắt buộc'],
    enum: {
      values: [1, 2, 3, 4, 5, 6, 7],
      message: 'Phần thi phải từ 1 đến 7',
    },
  },
  questions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: [true, 'ID câu hỏi là bắt buộc'],
        refPath: 'questions.modelName', // Động, dựa trên examType và part
      },
      modelName: {
        type: String,
        required: [true, 'Tên mô hình là bắt buộc'],
        enum: [
          'ListeningTOEICPart1',
          'ListeningTOEICPart2',
          'ListeningTOEICPart3',
          'ListeningTOEICPart4',
          'Question', // Reading_TOEIC
        ],
      },
    },
  ],
  status: {
    type: String,
    enum: {
      values: ['draft', 'public'],
      message: 'Trạng thái phải là draft hoặc public',
    },
    default: 'draft',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Giả sử bạn có mô hình User cho admin
    required: [true, 'Người tạo là bắt buộc'],
  },
  difficulty: {
    type: Number,
    enum: {
      values: [0, 1, 2],
      message: 'Độ khó phải là 0 (dễ), 1 (trung bình) hoặc 2 (khó)',
    },
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Validate: Đảm bảo modelName phù hợp với examType và part
examPartSchema.pre('validate', function(next) {
  const validModels = {
    Listening: {
      1: 'ListeningTOEICPart1',
      2: 'ListeningTOEICPart2',
      3: 'ListeningTOEICPart3',
      4: 'ListeningTOEICPart4',
    },
    Reading: {
      5: 'Question',
      6: 'Question',
      7: 'Question',
    },
  };

  this.questions.forEach(q => {
    const expectedModel = validModels[this.examType]?.[this.part];
    if (!expectedModel || q.modelName !== expectedModel) {
      next(new Error(`Câu hỏi trong ${this.examType} Part ${this.part} phải thuộc mô hình ${expectedModel}`));
    }
  });

  next();
});

// Index để tìm kiếm nhanh theo examType và part
examPartSchema.index({ examType: 1, part: 1, status: 1 });

const ExamPart = mongoose.model('ExamPart', examPartSchema);

module.exports = ExamPart;