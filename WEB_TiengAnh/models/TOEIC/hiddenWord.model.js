const mongoose = require('mongoose');

const hiddenWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  image: { type: String, required: true },
  hints: {
    type: [String],
    validate: v => v.length === 5
  }
}, { timestamps: true }); // This will automatically add createdAt and updatedAt fields

module.exports = mongoose.model('HiddenWord', hiddenWordSchema);
