const Speaking = require('../../models/TOEIC/speaking.model');

// Lấy đề Speaking bằng ID
exports.getPractice = async (req, res) => {
  try {
    const speech = await Speaking.findById(req.params.id);
    if (!speech) {
      return res.status(404).send('Đề không tồn tại');
    }
    res.render('client/speaking-practice', { 
      speech,
      // Truyền text đã làm sạch (bỏ dấu câu, viết thường)
      cleanedText: speech.content.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').toLowerCase()
    });
  } catch (error) {
    res.status(500).send('Lỗi server');
  }
};