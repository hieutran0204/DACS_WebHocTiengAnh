const mongoose = require('mongoose');

const listeningSchema = new mongoose.Schema({
    part: Number,
    audioUrl: String, // Đường dẫn đến file mp3
    questionText: String,
    options: [String],
    correctAnswer: String,
    explanation: String,
    createdAt: { type: Date, default: Date.now }
});

const ListeningTOEIC = mongoose.model('ListeningTOEIC', listeningSchema);

module.exports = ListeningTOEIC;
