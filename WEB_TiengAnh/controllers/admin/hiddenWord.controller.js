const HiddenWord = require('../../models/TOEIC/hiddenWord.model');
const path = require('path');
const fs = require('fs');

// Hiển thị form tạo mới
exports.getCreateForm = (req, res) => {
  res.render('admin/pages/TOEIC/create-hidden-word');
};

// Tạo Hidden Word mới
exports.createHiddenWord = async (req, res) => {
  const { word, hint0, hint1, hint2, hint3, hint4 } = req.body;
  const image = req.file?.filename;

  if (!image) return res.send('Image upload failed');

  try {
    const hints = [hint0, hint1, hint2, hint3, hint4];
    if (hints.some(hint => !hint)) {
      req.flash('error', 'Tất cả gợi ý phải được nhập');
      return res.redirect('/admin/hidden-word/create');
    }

    await HiddenWord.create({ 
      word, 
      image, 
      hints,
      createdAt: new Date()
    });
    req.flash('success', 'Tạo Hidden Word thành công');
    res.redirect('/admin/hidden-word/list');
  } catch (error) {
    console.error('Lỗi khi tạo Hidden Word:', error);
    req.flash('error', 'Tạo Hidden Word thất bại');
    res.redirect('/admin/hidden-word/create');
  }
};

// Hiển thị danh sách Hidden Word
exports.getHiddenWordList = async (req, res) => {
  try {
    const hiddenWords = await HiddenWord.find()
      .sort({ createdAt: -1 })
      .lean();

    const processedWords = hiddenWords.map(word => ({
      ...word,
      createdAt: word.createdAt || new Date(0)
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

// Hiển thị form chỉnh sửa Hidden Word
exports.getEditForm = async (req, res) => {
  try {
    const hiddenWord = await HiddenWord.findById(req.params.id).lean();
    if (!hiddenWord) {
      req.flash('error', 'Không tìm thấy Hidden Word');
      return res.redirect('/admin/hidden-word/list');
    }

    res.render('admin/pages/TOEIC/edit-hidden-word', {
      hiddenWord,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi khi tải form chỉnh sửa Hidden Word:', error);
    req.flash('error', 'Lỗi khi tải form chỉnh sửa');
    res.redirect('/admin/hidden-word/list');
  }
};

// Cập nhật Hidden Word
exports.updateHiddenWord = async (req, res) => {
  const { word, hint0, hint1, hint2, hint3, hint4 } = req.body;
  const newImage = req.file?.filename;

  try {
    const hiddenWord = await HiddenWord.findById(req.params.id);
    if (!hiddenWord) {
      req.flash('error', 'Không tìm thấy Hidden Word');
      return res.redirect('/admin/hidden-word/list');
    }

    hiddenWord.word = word;
    const hints = [hint0, hint1, hint2, hint3, hint4];
    if (hints.some(hint => !hint)) {
      req.flash('error', 'Tất cả gợi ý phải được nhập');
      return res.redirect(`/admin/hidden-word/edit/${req.params.id}`);
    }
    hiddenWord.hints = hints;

    if (newImage) {
      const oldImagePath = path.join(__dirname, '../../public/admin/img/uploads_reading_TOEIC/', hiddenWord.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
      hiddenWord.image = newImage;
    }

    await hiddenWord.save();
    req.flash('success', 'Cập nhật Hidden Word thành công');
    res.redirect('/admin/hidden-word/list');
  } catch (error) {
    console.error('Lỗi khi cập nhật Hidden Word:', error);
    req.flash('error', 'Cập nhật Hidden Word thất bại');
    res.redirect(`/admin/hidden-word/edit/${req.params.id}`);
  }
};

// Xóa Hidden Word
exports.deleteHiddenWord = async (req, res) => {
  try {
    const word = await HiddenWord.findByIdAndDelete(req.params.id);
    
    if (!word) {
      req.flash('error', 'Không tìm thấy từ cần xóa');
      return res.redirect('/admin/hidden-word/list');
    }

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