const Transcription = require('../../models/TOEIC/transcription.model');
const fs = require('fs');
const path = require('path');

exports.createTranscription = async (req, res) => {
  try {
    const audioFile = req.files['audio'] ? req.files['audio'][0] : null;
    const imageFile = req.files['image'] ? req.files['image'][0] : null;
    const { title, transcriptText } = req.body;

    if (!title || !transcriptText) {
      throw new Error('Tiêu đề và transcript không được để trống');
    }

    const newTranscription = new Transcription({
      title,
      transcriptText
    });

    if (audioFile) {
      newTranscription.audioPath = `/shared/audio/transcription/${audioFile.filename}`;
    }
    if (imageFile) {
      newTranscription.imagePath = `/shared/images/transcription/${imageFile.filename}`;
    }

    await newTranscription.save();
    req.flash('success', 'Tạo bài transcription thành công');
    res.redirect('/admin/transcription');
  } catch (error) {
    console.error('Lỗi tạo transcription:', error);
    req.flash('error', 'Lỗi tạo transcription: ' + error.message);
    res.redirect('/admin/transcription/create');
  }
};

exports.listTranscriptions = async (req, res) => {
  try {
    const items = await Transcription.find().sort({ createdAt: -1 }).lean();
    res.render('admin/pages/TOEIC/transcription-list', {
      items,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi lấy danh sách transcription:', error);
    res.render('admin/pages/TOEIC/transcription-list', {
      items: [],
      success: null,
      error: 'Lỗi server khi lấy danh sách transcription'
    });
  }
};

exports.deleteTranscription = async (req, res) => {
  try {
    const transcription = await Transcription.findById(req.params.id);
    if (!transcription) {
      req.flash('error', 'Transcription không tồn tại');
      return res.redirect('/admin/transcription');
    }

    // Xóa file audio nếu có
    if (transcription.audioPath) {
      const audioFilePath = path.join(__dirname, '..', '..', 'public', transcription.audioPath.replace(/^\//, ''));
      if (fs.existsSync(audioFilePath)) {
        fs.unlinkSync(audioFilePath);
        console.log('Đã xóa file audio:', audioFilePath);
      }
    }

    // Xóa file image nếu có
    if (transcription.imagePath) {
      const imageFilePath = path.join(__dirname, '..', '..', 'public', transcription.imagePath.replace(/^\//, ''));
      if (fs.existsSync(imageFilePath)) {
        fs.unlinkSync(imageFilePath);
        console.log('Đã xóa file image:', imageFilePath);
      }
    }

    await Transcription.findByIdAndDelete(req.params.id);
    req.flash('success', 'Xóa bài transcription thành công');
    res.redirect('/admin/transcription');
  } catch (error) {
    console.error('Lỗi xóa transcription:', error);
    req.flash('error', 'Lỗi xóa transcription: ' + error.message);
    res.redirect('/admin/transcription');
  }
};