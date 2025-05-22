const ExamPart_Writing = require('../../models/TOEIC/ExamPart_Writing.model');

// Lấy danh sách đề thi Writing
exports.getExamWritingList = async (req, res) => {
  try {
    const writings = await ExamPart_Writing.find({ status: 'public' })
      .sort({ createdAt: -1 })
      .populate('questions')
      .populate('createdBy', 'username')
      .lean();
    res.render('client/pages/exam-writing-list', {
      writings,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề Writing:', error);
    req.flash('error', 'Không thể tải danh sách đề thi. Vui lòng thử lại sau.');
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
    const writing = await ExamPart_Writing.findOne({ _id: req.params.id, status: 'public' })
      .populate('questions')
      .lean();
    if (!writing) {
      req.flash('error', 'Đề thi không tồn tại hoặc chưa được công khai');
      return res.redirect('/testtoeic/writing-list');
    }
    res.render('client/pages/exam-writing', {
      writing,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error('Lỗi khi lấy đề Writing:', error);
    req.flash('error', 'Lỗi khi tải đề thi. Vui lòng thử lại sau.');
    res.redirect('/testtoeic/writing-list');
  }
};

// Nộp bài thi Writing
exports.submitWritingExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const files = req.files || [];
    const writing = await ExamPart_Writing.findOne({ _id: id, status: 'public' })
      .populate('questions');
    if (!writing) {
      req.flash('error', 'Đề thi không tồn tại hoặc chưa được công khai');
      return res.redirect('/testtoeic/writing-list');
    }

    const Submission = require('../../models/TOEIC/Submission.model');
    const submissionAnswers = answers.map((answer, index) => ({
      questionId: writing.questions[index]?._id,
      answer: answer.text || '',
      file: files[index] ? `/shared/images/writing_TOEIC/${files[index].filename}` : null
    }));

    const submission = new Submission({
      userId: req.user?._id,
      examId: id,
      answers: submissionAnswers,
      submittedAt: new Date()
    });
    await submission.save();

    req.flash('success', 'Nộp bài thi Writing thành công');
    res.redirect('/testtoeic/writing-list');
  } catch (error) {
    console.error('Lỗi khi nộp bài Writing:', error);
    req.flash('error', 'Lỗi khi nộp bài thi. Vui lòng thử lại sau.');
    res.redirect('/testtoeic/writing-list');
  }
};