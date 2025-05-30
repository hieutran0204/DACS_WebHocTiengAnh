const Transcription = require('../../models/TOEIC/transcription.model');

function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/gi, '').trim();
}

exports.listAll = async (req, res) => {
  try {
    const list = await Transcription.find().sort({ createdAt: -1 }).lean();
    if (!list.length) {
      console.log('Không có bài transcription nào');
    }
    res.render('client/pages/transcription-list', { list, error: null });
  } catch (error) {
    console.error('Lỗi lấy danh sách transcription:', error);
    res.render('client/pages/transcription-list', { list: [], error: 'Lỗi server khi lấy danh sách transcription' });
  }
};

exports.playAndCompare = async (req, res) => {
  try {
    const item = await Transcription.findById(req.params.id).lean();
    if (!item) {
      return res.render('client/pages/transcription-play', {
        item: null,
        error: 'Không tìm thấy bài transcription',
        result: null
      });
    }

    console.log('Audio path:', item.audioPath);
    console.log('Image path:', item.imagePath);
    console.log('Full item:', item);

    const audioPath = item.audioPath && !item.audioPath.startsWith('/') ? `/${item.audioPath}` : item.audioPath;
    const imagePath = item.imagePath && !item.imagePath.startsWith('/') ? `/${item.imagePath}` : item.imagePath;

    res.render('client/pages/transcription-play', {
      item: {
        ...item,
        audioPath,
        imagePath
      },
      error: null,
      result: null
    });
  } catch (error) {
    console.error('Lỗi khi lấy bài transcription:', error);
    res.render('client/pages/transcription-play', {
      item: null,
      error: 'Lỗi server khi lấy bài transcription',
      result: null
    });
  }
};

exports.checkTranscript = async (req, res) => {
  try {
    const item = await Transcription.findById(req.params.id).lean();
    if (!item) {
      return res.render('client/pages/transcription-play', {
        item: null,
        error: 'Không tìm thấy bài transcription',
        result: null
      });
    }

    const userInput = normalize(req.body.userText || '');
    const original = normalize(item.transcriptText || '');

    const userWords = userInput.split(/\s+/).filter(word => word);
    const originalWords = original.split(/\s+/).filter(word => word);

    // So sánh từng từ
    const comparison = [];
    for (let i = 0; i < Math.max(userWords.length, originalWords.length); i++) {
      const userWord = userWords[i] || '';
      const originalWord = originalWords[i] || '';
      comparison.push({
        userWord,
        originalWord,
        isCorrect: userWord === originalWord
      });
    }

    const matchCount = comparison.filter(item => item.isCorrect).length;
    const percent = originalWords.length > 0 ? Math.round((matchCount / originalWords.length) * 100) : 0;

    const audioPath = item.audioPath && !item.audioPath.startsWith('/') ? `/${item.audioPath}` : item.audioPath;
    const imagePath = item.imagePath && !item.imagePath.startsWith('/') ? `/${item.imagePath}` : item.imagePath;

    res.render('client/pages/transcription-play', {
      item: {
        ...item,
        audioPath,
        imagePath
      },
      result: {
        percent,
        comparison,
        userInput: req.body.userText || '',
        original: item.transcriptText
      },
      error: null
    });
  } catch (error) {
    console.error('Lỗi khi so sánh transcript:', error);
    res.render('client/pages/transcription-play', {
      item: null,
      error: 'Lỗi server khi so sánh transcript',
      result: null
    });
  }
};