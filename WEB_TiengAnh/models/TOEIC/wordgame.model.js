const mongoose = require('mongoose');

const wordGameSchema = new mongoose.Schema({
  word: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  hint: {
    type: String,
    default: ""
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('WordGame', wordGameSchema);
