const HiddenWord = require('../../models/TOEIC/hiddenWord.model');

exports.getCreateForm = (req, res) => {
  res.render('admin/pages/TOEIC/create-hidden-word');
};

exports.createHiddenWord = async (req, res) => {
  const { word, hints } = req.body;
  const image = req.file?.filename;

  if (!image) return res.send('Image upload failed');

  try {
    await HiddenWord.create({ 
      word, 
      image, 
      hints: JSON.parse(hints),
      createdAt: new Date() // Thêm trường createdAt thủ công
    });
    res.redirect('/admin/hidden-word/list');
  } catch (error) {
    req.flash('error', 'Tạo Hidden Word thất bại');
    res.redirect('/admin/hidden-word/create');
  }
};

exports.getHiddenWordList = async (req, res) => {
  try {
    const hiddenWords = await HiddenWord.find()
      .sort({ createdAt: -1 })
      .lean(); // Chuyển sang plain object để xử lý dễ dàng hơn

    // Thêm fallback cho các bản ghi không có createdAt
    const processedWords = hiddenWords.map(word => ({
      ...word,
      createdAt: word.createdAt || new Date(0) // Nếu không có sẽ dùng epoch time
    }));

    res.render('admin/pages/TOEIC/hidden-word-list', { 
      hiddenWords: processedWords,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi khi tải danh sách Hidden Word:', error);
    req.flash('error', 'Lỗi khi tải danh sách Hidden Word');
    res.redirect('/admin/dashboard');
  }
};
exports.deleteHiddenWord = async (req, res) => {
  try {
    const word = await HiddenWord.findByIdAndDelete(req.params.id);
    
    if (!word) {
      req.flash('error', 'Không tìm thấy từ cần xóa');
      return res.redirect('/admin/hidden-word/list');
    }

    // Xóa file ảnh trong thư mục uploads
    const imagePath = path.join(__dirname, '../../public/admin/img/uploads_reading_TOEIC/', word.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    req.flash('success', 'Xóa Hidden Word thành công');
    res.redirect('/admin/hidden-word/list');
  } catch (error) {
    console.error('Lỗi khi xóa Hidden Word:', error);
    req.flash('error', 'Xóa Hidden Word thất bại');
    res.redirect('/admin/hidden-word/list');
  }
};