const ExamPart_Reading = require('../../models/TOEIC/ExamPart_Reading.model');
const Question = require('../../models/TOEIC/readingToiec.model');

// Hiển thị danh sách đề thi Reading
exports.getAllExamParts = async (req, res) => {
  try {
    const examParts = await ExamPart_Reading.find()
      .populate('createdBy', 'username')
      .lean();

    const populatedExamParts = await Promise.all(examParts.map(async (examPart) => {
      const questions = await Question.find({ _id: { $in: examPart.questions.map(q => q.questionId) } })
        .select('part questionN question options correctAnswer passage blanks questions explanation Img')
        .lean();

      return {
        ...examPart,
        questions: questions.map((question, index) => ({
          questionId: question,
          modelName: 'Question'
        }))
      };
    }));

    res.render('admin/pages/TOEIC/exam-list-reading', {
      examParts: populatedExamParts,
      success: req.flash('success'),
      error: req.flash('error'),
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
      statusMap: { draft: 'Bản nháp', public: 'Công khai' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy danh sách đề thi Reading');
    res.render('admin/pages/TOEIC/exam-list-reading', { examParts: [], error: req.flash('error') });
  }
};

// Hiển thị form tạo đề thi Reading
exports.showCreateForm = async (req, res) => {
  try {
    const questions = await Question.find()
      .select('part questionN question')
      .lean();

    res.render('admin/pages/TOEIC/create-exam-reading', {
      questions,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy danh sách câu hỏi');
    res.render('admin/pages/TOEIC/create-exam-reading', {
      questions: [],
      error: req.flash('error')
    });
  }
};

// Tạo đề thi Reading
exports.createExamPart = async (req, res) => {
  try {
    const { parts, questionIds } = req.body;
    const adminId = req.user._id;

    if (!parts || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      req.flash('error', 'Vui lòng chọn ít nhất một phần và một câu hỏi');
      return res.redirect('/admin/TOEIC/exam-reading/create');
    }

    const partArray = Array.isArray(parts) ? parts.map(Number) : [Number(parts)];
    if (!partArray.every(p => [5, 6, 7].includes(p))) {
      req.flash('error', 'Phần thi không hợp lệ, chỉ hỗ trợ Part 5, 6, 7');
      return res.redirect('/admin/TOEIC/exam-reading/create');
    }

    const questions = await Question.find({ _id: { $in: questionIds } }).lean();
    if (questions.length !== questionIds.length) {
      req.flash('error', 'Một số câu hỏi không tồn tại');
      return res.redirect('/admin/TOEIC/exam-reading/create');
    }

    const examQuestions = questions.map(q => ({
      questionId: q._id
    }));

    const avgDifficulty = questions.reduce((sum, q) => sum + (q.difficulty || 0), 0) / questions.length;

    const examPart = new ExamPart_Reading({
      examType: 'Reading',
      part: partArray,
      questions: examQuestions,
      createdBy: adminId,
      difficulty: Math.round(avgDifficulty)
    });

    await examPart.save();
    req.flash('success', `Tạo đề thi Reading thành công`);
    res.redirect('/admin/TOEIC/exam-reading');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi tạo đề thi Reading');
    res.redirect('/admin/TOEIC/exam-reading/create');
  }
};

// Hiển thị chi tiết đề thi Reading
exports.showExamPartDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const examPart = await ExamPart_Reading.findById(id)
      .populate('createdBy', 'username')
      .lean();

    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/admin/TOEIC/exam-reading');
    }

    const questions = await Question.find({ _id: { $in: examPart.questions.map(q => q.questionId) } })
      .select('part questionN question options correctAnswer passage blanks questions explanation Img')
      .lean();

    const questionsByPart = {};
    questions.forEach(question => {
      const partKey = `Reading TOEIC Part ${question.part}`;
      if (!questionsByPart[partKey]) {
        questionsByPart[partKey] = [];
      }
      questionsByPart[partKey].push(question);
    });

    for (const partKey in questionsByPart) {
      questionsByPart[partKey].sort((a, b) => (a.questionN || 0) - (b.questionN || 0));
    }

    res.render('admin/pages/TOEIC/exam-detail-reading', {
      examPart,
      questionsByPart,
      statusMap: { draft: 'Bản nháp', public: 'Công khai' },
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy chi tiết đề thi Reading');
    res.redirect('/admin/TOEIC/exam-reading');
  }
};

// Xóa đề thi Reading
exports.deleteExamPart = async (req, res) => {
  try {
    const { id } = req.params;
    const examPart = await ExamPart_Reading.findByIdAndDelete(id);

    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi để xóa');
      return res.redirect('/admin/TOEIC/exam-reading');
    }

    req.flash('success', 'Xóa đề thi Reading thành công');
    res.redirect('/admin/TOEIC/exam-reading');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi xóa đề thi Reading');
    res.redirect('/admin/TOEIC/exam-reading');
  }
};
exports.publishExamPart = async (req, res) => {
  try {
    const { id } = req.params;

    const examPart = await ExamPart_Reading.findById(id);
    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/admin/TOEIC/exam-reading');
    }

    examPart.status = 'public';
    await examPart.save();

    req.flash('success', 'Đề thi đã được công khai thành công');
    res.redirect('/admin/TOEIC/exam-reading');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi công khai đề thi');
    res.redirect('/admin/TOEIC/exam-reading');
  }
};