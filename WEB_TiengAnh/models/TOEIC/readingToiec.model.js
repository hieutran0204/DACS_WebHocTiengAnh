
// const mongoose = require("mongoose");

// const optionSchema = new mongoose.Schema({
//   question: String,
//   options: [String],
//   correctAnswer: {
//     type: String,
//     enum: ["A", "B", "C", "D"],
//   },
// });

// const blankOptionSchema = new mongoose.Schema({
//   blank: Number,
//   options: [String],
//   correctAnswer: {
//     type: String,
//     enum: ["A", "B", "C", "D"],
//   },
// });

// const readingToiecSchema = new mongoose.Schema(
//   {
//     MaCC: { type: String, required: true },
//     TopicN: { type: Number, required: true },
//     part: { type: Number, required: true },
//     questionN: { type: Number, required: true },
//     question: { type: String }, // Part 5 only
//     options: [String],          // Part 5 only
//     correctAnswer: {
//       type: String,
//       enum: ["A", "B", "C", "D"],
//     }, // Part 5 only
//     passage: { type: String }, // Part 6 & 7
//     questions: [optionSchema], // Part 7
//     blanks: [blankOptionSchema], // Part 6
//     explanation: { type: String },
//     Img: { type: String },
//     difficulty: {
//       type: Number,
//       enum: [0, 1, 2],
//       default: 0,
//     },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("Question", readingToiecSchema, "Reading_TOEIC");
const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true, validate: {
    validator: arr => arr.length === 4,
    message: "Phải có đúng 4 đáp án"
  }},
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true
  }
});

const blankOptionSchema = new mongoose.Schema({
  blank: { type: Number, required: true },
  options: { type: [String], required: true, validate: {
    validator: arr => arr.length === 4,
    message: "Phải có đúng 4 đáp án"
  }},
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
    required: true
  }
});

const readingToiecSchema = new mongoose.Schema(
  {
    MaCC: { type: String, required: true },
    TopicN: { type: Number, required: true },
    part: { type: Number, enum: [5, 6, 7], required: true },
    questionN: { type: Number, required: true },
    question: { type: String }, // Part 5 only
    options: { type: [String], validate: {
      validator: arr => arr.length === 0 || arr.length === 4,
      message: "Phải có đúng 4 đáp án hoặc để trống"
    }}, // Part 5 only
    correctAnswer: {
      type: String,
      enum: ["A", "B", "C", "D"]
    }, // Part 5 only
    passage: { type: String }, // Part 6 & 7
    questions: [optionSchema], // Part 7
    blanks: [blankOptionSchema], // Part 6
    explanation: { type: String, default: '' },
    Img: { type: String },
    difficulty: {
      type: Number,
      enum: [0, 1, 2],
      required: true
    }
  },
  { timestamps: true }
);

// Thêm index để tối ưu tìm kiếm
readingToiecSchema.index({ MaCC: 1, TopicN: 1, part: 1, questionN: 1 });

module.exports = mongoose.model("Question", readingToiecSchema, "Reading_TOEIC");