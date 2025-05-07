const WritingTOEIC = require('../../models/TOEIC/writingTOEIC.model');

// Lấy danh sách đề thi Writing
exports.getExamWritingList = async (req, res) => {
  try {
    const writings = await WritingTOEIC.find().sort({ createdAt: -1 });
    res.render('client/pages/exam-writing-list', {
      writings,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề Writing:', error);
    req.flash('error', 'Không thể tải danh sách đề thi');
    res.render('client/pages/exam-writing-list', {
      writings: [],
      success: req.flash('success'),
      error: req.flash('error')
    });
  }
};

// Lấy chi tiết một đề thi Writing
exports.getPublicWritingExams = async (req, res) => {
  try {
    const writing = await WritingTOEIC.findById(req.params.id);
    if (!writing) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/testtoeic/writing-list');
    }
    res.render('client/pages/exam-writing', {
      writing,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi khi lấy đề Writing:', error);
    req.flash('error', 'Lỗi khi tải đề thi');
    res.redirect('/testtoeic/writing-list');
  }
};