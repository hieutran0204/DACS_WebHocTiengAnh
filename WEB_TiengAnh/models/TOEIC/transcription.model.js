const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    audioPath: { 
      type: String, 
      required: true,
      validate: {
        validator: function(v) {
          // Kiểm tra đuôi file hợp lệ
          return /\.(mp3|wav|ogg)$/i.test(v);
        },
        message: props => `${props.value} không phải đường dẫn audio hợp lệ!`
      }
    },
    transcriptText: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  });

module.exports = mongoose.model('Transcription', transcriptionSchema);
