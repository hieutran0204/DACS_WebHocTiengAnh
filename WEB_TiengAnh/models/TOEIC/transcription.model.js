const mongoose = require('mongoose');

const transcriptionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  audioPath: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Cho phép không có audio
        return /\.(mp3|wav)$/i.test(v); // Chỉ hỗ trợ mp3 và wav
      },
      message: props => `${props.value} không phải đường dẫn audio hợp lệ!`
    }
  },
  imagePath: { 
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Cho phép không có hình ảnh
        return /\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: props => `${props.value} không phải đường dẫn hình ảnh hợp lệ!`
    }
  },
  transcriptText: { 
    type: String, 
    required: true,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Transcription', transcriptionSchema);