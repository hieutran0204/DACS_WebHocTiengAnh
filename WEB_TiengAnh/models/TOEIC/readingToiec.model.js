
const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  question: String,
  options: [String],
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
  },
});

const blankOptionSchema = new mongoose.Schema({
  blank: Number,
  options: [String],
  correctAnswer: {
    type: String,
    enum: ["A", "B", "C", "D"],
  },
});

const readingToiecSchema = new mongoose.Schema(
  {
    MaCC: { type: String, required: true },
    TopicN: { type: Number, required: true },
    part: { type: Number, required: true },
    questionN: { type: Number, required: true },
    question: { type: String }, // Part 5 only
    options: [String],          // Part 5 only
    correctAnswer: {
      type: String,
      enum: ["A", "B", "C", "D"],
    }, // Part 5 only
    passage: { type: String }, // Part 6 & 7
    questions: [optionSchema], // Part 7
    blanks: [blankOptionSchema], // Part 6
    explanation: { type: String },
    Img: { type: String },
    difficulty: {
      type: Number,
      enum: [0, 1, 2],
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", readingToiecSchema, "Reading_TOEIC");
