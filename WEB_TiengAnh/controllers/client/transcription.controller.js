const Transcription = require('../../models/TOEIC/transcription.model');

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
}

exports.listAll = async (req, res) => {
  const list = await Transcription.find().sort({ createdAt: -1 });
  res.render('client/pages/transcription-list', { list });
};

exports.playAndCompare = async (req, res) => {
    const item = await Transcription.findById(req.params.id);
    
    // Thêm log để debug
    console.log('Audio path:', item.audioPath); 
    console.log('Full item:', item);
    
    // Đảm bảo đường dẫn audio đúng format
    const audioPath = item.audioPath.startsWith('/') ? item.audioPath : `/${item.audioPath}`;
    
    res.render('client/pages/transcription-play', { 
      item: {
        ...item._doc,
        audioPath: audioPath
      } 
    });
  };

exports.checkTranscript = async (req, res) => {
  const item = await Transcription.findById(req.params.id);
  const userInput = normalize(req.body.userText);
  const original = normalize(item.transcriptText);

  const userWords = userInput.split(/\s+/);
  const originalWords = original.split(/\s+/);
  const matchCount = userWords.filter((word, i) => word === originalWords[i]).length;
  const percent = Math.round((matchCount / originalWords.length) * 100);

  res.render('client/pages/transcription-play', { item, result: percent });
};
