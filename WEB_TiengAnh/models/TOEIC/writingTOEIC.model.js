const mongoose = require("mongoose");

const part8Schema = new mongoose.Schema({
  keyword1: { 
    type: String, 
    required: true, 
    maxlength: 100,
    trim: true
  },
  keyword2: { 
    type: String, 
    required: true, 
    maxlength: 100,
    trim: true
  },
  img: { 
    type: String, 
    required: true,
    validate: {
      validator: (v) => /\.(jpg|jpeg|png|gif)$/i.test(v),
      message: "Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif)."
    }
  },
});

const part9Schema = new mongoose.Schema({
  situation: { 
    type: String, 
    required: true, 
    maxlength: 1000,
    trim: true
  },
  requirements: { 
    type: String, 
    required: true, 
    maxlength: 1000,
    trim: true
  },
  sampleAnswer: { 
    type: String, 
    maxlength: 2000,
    trim: true,
    default: ""
  },
});

const part10Schema = new mongoose.Schema({
  question: { 
    type: String, 
    required: true, 
    maxlength: 1000,
    trim: true
  },
  sampleAnswer: { 
    type: String, 
    maxlength: 3000,
    trim: true,
    default: ""
  },
});

const writingToeicSchema = new mongoose.Schema(
  {
    MaCC: { 
      type: String, 
      required: true,
      trim: true
    },
    TopicN: { 
      type: Number, 
      required: true,
      min: 1
    },
    part: { 
      type: Number, 
      enum: [8, 9, 10], 
      required: true 
    },
    questionN: { 
      type: Number, 
      required: true,
      min: 1
    },
    part8: part8Schema,
    part9: part9Schema,
    part10: part10Schema,
    notes: { 
      type: String, 
      maxlength: 2000,
      trim: true,
      default: ""
    },
    difficulty: {
      type: Number,
      enum: [0, 1, 2],
      required: true,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index để đảm bảo tính duy nhất
writingToeicSchema.index({ 
  MaCC: 1, 
  TopicN: 1, 
  part: 1, 
  questionN: 1 
}, { unique: true });

module.exports = mongoose.models.WritingQuestion || 
                mongoose.model("WritingQuestion", writingToeicSchema, "Writing_TOEIC");