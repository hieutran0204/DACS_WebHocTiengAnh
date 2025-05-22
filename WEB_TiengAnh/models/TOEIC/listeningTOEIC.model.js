const mongoose = require('mongoose');

// Part 1: Picture Description
const part1Schema = new mongoose.Schema({
  part: {
    type: Number,
    required: [true, 'Phần thi là bắt buộc'],
    enum: {
      values: [1],
      message: 'Phần thi phải là 1'
    },
    default: 1
  },
  questionNumber: {
    type: Number,
    required: [true, 'Số câu hỏi là bắt buộc'],
    min: [1, 'Số câu hỏi tối thiểu là 1'],
    max: [100, 'Số câu hỏi tối đa là 100'],
    validate: {
      validator: Number.isInteger,
      message: 'Số câu hỏi phải là số nguyên'
    }
  },
  audioUrl: {
    type: String,
    required: [true, 'Đường dẫn audio là bắt buộc'],
    match: [/^\/shared\/audio\/listening_TOEIC\/.+$/, 'Đường dẫn audio không hợp lệ']
  },
  imageUrl: {
    type: String,
    required: [true, 'Đường dẫn hình ảnh là bắt buộc'],
    match: [/^\/shared\/images\/listening_TOEIC\/.+$/, 'Đường dẫn hình ảnh không hợp lệ']
  },
  paragraph: {
    type: String,
    required: [true, 'Đoạn văn là bắt buộc'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Các lựa chọn là bắt buộc'],
    validate: {
      validator: function(v) {
        return v.length === 4 && v.every(opt => opt.trim().length > 0);
      },
      message: 'Phải có đúng 4 lựa chọn và không được để trống'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Đáp án đúng là bắt buộc'],
    enum: {
      values: ['A', 'B', 'C', 'D'],
      message: 'Đáp án phải là A, B, C hoặc D'
    },
    uppercase: true,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Part 2: Question-Response
const part2Schema = new mongoose.Schema({
  part: {
    type: Number,
    required: [true, 'Phần thi là bắt buộc'],
    enum: {
      values: [2],
      message: 'Phần thi phải là 2'
    },
    default: 2
  },
  questionNumber: {
    type: Number,
    required: [true, 'Số câu hỏi là bắt buộc'],
    min: [1, 'Số câu hỏi tối thiểu là 1'],
    max: [100, 'Số câu hỏi tối đa là 100'],
    validate: {
      validator: Number.isInteger,
      message: 'Số câu hỏi phải là số nguyên'
    }
  },
  audioUrl: {
    type: String,
    required: [true, 'Đường dẫn audio là bắt buộc'],
    match: [/^\/shared\/audio\/listening_TOEIC\/.+$/, 'Đường dẫn audio không hợp lệ']
  },
  questionText: {
    type: String,
    required: [true, 'Nội dung câu hỏi là bắt buộc'],
    trim: true
  },
  options: {
    type: [String],
    required: [true, 'Các lựa chọn là bắt buộc'],
    validate: {
      validator: function(v) {
        return v.length === 3 && v.every(opt => opt.trim().length > 0);
      },
      message: 'Phải có đúng 3 lựa chọn và không được để trống'
    }
  },
  correctAnswer: {
    type: String,
    required: [true, 'Đáp án đúng là bắt buộc'],
    enum: {
      values: ['A', 'B', 'C'],
      message: 'Đáp án phải là A, B hoặc C'
    },
    uppercase: true,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Question Schema for Part 3 & 4
const questionSchema = new mongoose.Schema({
  text: { 
    type: String, 
    required: true,
    trim: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length === 4 && v.every(opt => opt.trim().length > 0);
      },
      message: 'Mỗi câu hỏi phải có đúng 4 lựa chọn và không được để trống'
    }
  },
  correctAnswer: { 
    type: String, 
    required: true,
    enum: ['A', 'B', 'C', 'D'],
    uppercase: true,
    trim: true
  },
  explanation: {
    type: String,
    trim: true
  }
});

// Part 3: Conversations
const part3Schema = new mongoose.Schema({
  part: {
    type: Number,
    required: [true, 'Phần thi là bắt buộc'],
    enum: {
      values: [3],
      message: 'Phần thi phải là 3'
    },
    default: 3
  },
  questionNumber: {
    type: Number,
    required: [true, 'Số câu hỏi là bắt buộc'],
    min: [1, 'Số câu hỏi tối thiểu là 1'],
    max: [100, 'Số câu hỏi tối đa là 100'],
    validate: {
      validator: Number.isInteger,
      message: 'Số câu hỏi phải là số nguyên'
    }
  },
  audioUrl: {
    type: String,
    required: [true, 'Đường dẫn audio là bắt buộc'],
    match: [/^\/shared\/audio\/listening_TOEIC\/.+$/, 'Đường dẫn audio không hợp lệ']
  },
  transcript: {
    type: String,
    trim: true
  },
  diagramUrl: {
    type: String,
    match: [/^\/shared\/diagrams\/listening_TOEIC\/.+$/, 'Đường dẫn biểu đồ không hợp lệ']
  },
  questions: {
    type: [questionSchema],
    required: [true, 'Danh sách câu hỏi là bắt buộc'],
    validate: {
      validator: function(v) {
        return v.length === 3;
      },
      message: 'Phải có đúng 3 câu hỏi'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Part 4: Talks
const part4Schema = new mongoose.Schema({
  part: {
    type: Number,
    required: [true, 'Phần thi là bắt buộc'],
    enum: {
      values: [4],
      message: 'Phần thi phải là 4'
    },
    default: 4
  },
  questionNumber: {
    type: Number,
    required: [true, 'Số câu hỏi là bắt buộc'],
    min: [1, 'Số câu hỏi tối thiểu là 1'],
    max: [100, 'Số câu hỏi tối đa là 100'],
    validate: {
      validator: Number.isInteger,
      message: 'Số câu hỏi phải là số nguyên'
    }
  },
  audioUrl: {
    type: String,
    required: [true, 'Đường dẫn audio là bắt buộc'],
    match: [/^\/shared\/audio\/listening_TOEIC\/.+$/, 'Đường dẫn audio không hợp lệ']
  },
  transcript: {
    type: String,
    trim: true
  },
  diagramUrl: {
    type: String,
    match: [/^\/shared\/diagrams\/listening_TOEIC\/.+$/, 'Đường dẫn biểu đồ không hợp lệ']
  },
  questions: {
    type: [questionSchema],
    required: [true, 'Danh sách câu hỏi là bắt buộc'],
    validate: {
      validator: function(v) {
        return v.length === 3;
      },
      message: 'Phải có đúng 3 câu hỏi'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
part1Schema.index({ part: 1, questionNumber: 1 }, { unique: true });
part2Schema.index({ part: 1, questionNumber: 1 }, { unique: true });
part3Schema.index({ part: 1, questionNumber: 1 }, { unique: true });
part4Schema.index({ part: 1, questionNumber: 1 }, { unique: true });

// Virtuals
part1Schema.virtual('partName').get(function() {
  return 'Mô tả hình ảnh';
});
part2Schema.virtual('partName').get(function() {
  return 'Hỏi - Đáp';
});
part3Schema.virtual('partName').get(function() {
  return 'Hội thoại';
});
part4Schema.virtual('partName').get(function() {
  return 'Bài nói';
});

// Models
const ListeningTOEICPart1 = mongoose.model('ListeningTOEICPart1', part1Schema);
const ListeningTOEICPart2 = mongoose.model('ListeningTOEICPart2', part2Schema);
const ListeningTOEICPart3 = mongoose.model('ListeningTOEICPart3', part3Schema);
const ListeningTOEICPart4 = mongoose.model('ListeningTOEICPart4', part4Schema);

module.exports = {
  ListeningTOEICPart1,
  ListeningTOEICPart2,
  ListeningTOEICPart3,
  ListeningTOEICPart4
};