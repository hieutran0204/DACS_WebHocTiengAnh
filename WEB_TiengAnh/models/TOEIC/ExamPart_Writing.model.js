const mongoose = require("mongoose");

const examPartWritingSchema = new mongoose.Schema({
  examCode: { type: String, required: true },
  MaCC: { type: String, required: true },
  TopicN: { type: Number, required: true },
  difficulty: { type: Number, enum: [0, 1, 2], required: true },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "WritingQuestion",
    required: true,
  }],
  notes: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['draft', 'public'], 
    default: "draft", 
    required: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }, // Thêm trường createdBy
});

module.exports = mongoose.model("ExamPart_Writing", examPartWritingSchema);