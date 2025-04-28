const ExamPart = require('../../models/TOEIC/examPart.model');
const ListeningTOEICPart1 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart1;
const ListeningTOEICPart2 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart2;
const ListeningTOEICPart3 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart3;
const ListeningTOEICPart4 = require('../../models/TOEIC/listeningTOEIC.model').ListeningTOEICPart4;
const Question = require('../../models/TOEIC/readingToiec.model'); // Reading_TOEIC

// Xem danh sách tất cả đề thi
exports.getAllExamParts = async (req, res) => {
  try {
    const examParts = await ExamPart.find()
      .populate('createdBy', 'username') // Giả sử mô hình User có trường username
      .populate({
        path: 'questions.questionId',
        model: (doc) => doc.questions[0]?.modelName || 'Question',
      });

    res.render('admin/pages/TOEIC/exam-list-Toeic', {
      examParts,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy danh sách đề thi');
    res.render('admin/exam-parts/list', { examParts: [] });
  }
};

// Hiển thị form tạo đề thi
exports.showCreateForm = (req, res) => {
  res.render('admin/exam-parts/create', {
    success: req.flash('success'),
    error: req.flash('error'),
  });
};

// Tạo đề thi mới
exports.createExamPart = async (req, res) => {
  try {
    const { examType, part, questionIds } = req.body;
    const adminId = req.user._id; // Giả sử bạn có middleware xác thực để lấy user

    // Xác định mô hình dựa trên examType và part
    const modelMap = {
      Listening: {
        1: ListeningTOEICPart1,
        2: ListeningTOEICPart2,
        3: ListeningTOEICPart3,
        4: ListeningTOEICPart4,
      },
      Reading: {
        5: Question,
        6: Question,
        7: Question,
      },
    };

    const Model = modelMap[examType]?.[part];
    if (!Model) {
      req.flash('error', 'Loại đề hoặc phần thi không hợp lệ');
      return res.redirect('/admin/exam-parts/create');
    }

    // Kiểm tra xem các câu hỏi có tồn tại không
    const questions = await Model.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      req.flash('error', 'Một số câu hỏi không tồn tại');
      return res.redirect('/admin/exam-parts/create');
    }

    // Tạo danh sách câu hỏi cho ExamPart
    const examQuestions = questionIds.map(id => ({
      questionId: id,
      modelName: Model.modelName,
    }));

    // Tính độ khó trung bình
    const avgDifficulty = questions.reduce((sum, q) => sum + (q.difficulty || 0), 0) / questions.length;

    // Tạo đề thi mới
    const examPart = new ExamPart({
      examType,
      part,
      questions: examQuestions,
      createdBy: adminId,
      difficulty: Math.round(avgDifficulty),
    });

    await examPart.save();
    req.flash('success', 'Tạo đề thi thành công');
    res.redirect('/admin/exam-parts');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi tạo đề thi');
    res.redirect('/admin/exam-parts/create');
  }
};

// Cập nhật đề thi (hiển thị form chỉnh sửa)
exports.showUpdateForm = async (req, res) => {
  try {
    const { examPartId } = req.params;
    const examPart = await ExamPart.findById(examPartId)
      .populate({
        path: 'questions.questionId',
        model: (doc) => doc.questions[0]?.modelName || 'Question',
      });

    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/admin/exam-parts');
    }

    res.render('admin/exam-parts/edit', {
      examPart,
      success: req.flash('success'),
      error: req.flash('error'),
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy thông tin đề thi');
    res.redirect('/admin/exam-parts');
  }
};

// Cập nhật đề thi
exports.updateExamPart = async (req, res) => {
  try {
    const { examPartId } = req.params;
    const { questionIds, status, difficulty } = req.body;

    const examPart = await ExamPart.findById(examPartId);
    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/admin/exam-parts');
    }

    // Xác định mô hình dựa trên examType và part
    const modelMap = {
      Listening: {
        1: ListeningTOEICPart1,
        2: ListeningTOEICPart2,
        3: ListeningTOEICPart3,
        4: ListeningTOEICPart4,
      },
      Reading: {
        5: Question,
        6: Question,
        7: Question,
      },
    };

    const Model = modelMap[examPart.examType]?.[examPart.part];
    if (!Model) {
      req.flash('error', 'Loại đề hoặc phần thi không hợp lệ');
      return res.redirect(`/admin/exam-parts/edit/${examPartId}`);
    }

    // Nếu cập nhật danh sách câu hỏi
    if (questionIds) {
      const questions = await Model.find({ _id: { $in: questionIds } });
      if (questions.length !== questionIds.length) {
        req.flash('error', 'Một số câu hỏi không tồn tại');
        return res.redirect(`/admin/exam-parts/edit/${examPartId}`);
      }

      examPart.questions = questionIds.map(id => ({
        questionId: id,
        modelName: Model.modelName,
      }));

      // Tính lại độ khó trung bình
      const avgDifficulty = questions.reduce((sum, q) => sum + (q.difficulty || 0), 0) / questions.length;
      examPart.difficulty = Math.round(avgDifficulty);
    }

    // Cập nhật trạng thái hoặc độ khó nếu có
    if (status) examPart.status = status;
    if (difficulty !== undefined) examPart.difficulty = difficulty;

    await examPart.save();
    req.flash('success', 'Cập nhật đề thi thành công');
    res.redirect('/admin/exam-parts');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi cập nhật đề thi');
    res.redirect(`/admin/exam-parts/edit/${req.params.examPartId}`);
  }
};

// Xóa đề thi
exports.deleteExamPart = async (req, res) => {
  try {
    const { examPartId } = req.params;
    const examPart = await ExamPart.findByIdAndDelete(examPartId);

    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi để xóa');
      return res.redirect('/admin/exam-parts');
    }

    req.flash('success', 'Xóa đề thi thành công');
    res.redirect('/admin/exam-parts');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi xóa đề thi');
    res.redirect('/admin/exam-parts');
  }
};

// Công khai đề thi
exports.publishExamPart = async (req, res) => {
  try {
    const { examPartId } = req.params;
    const examPart = await ExamPart.findById(examPartId);

    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/admin/exam-parts');
    }

    if (examPart.status === 'public') {
      req.flash('error', 'Đề thi đã được công khai trước đó');
      return res.redirect('/admin/exam-parts');
    }

    examPart.status = 'public';
    await examPart.save();

    req.flash('success', 'Đã công khai đề thi thành công');
    res.redirect('/admin/exam-parts');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi công khai đề thi');
    res.redirect('/admin/exam-parts');
  }
};

// Lấy danh sách câu hỏi theo examType và part
exports.getQuestionsForExam = async (req, res) => {
  try {
    const { examType, part } = req.params;

    const modelMap = {
      listening: {
        1: ListeningTOEICPart1,
        2: ListeningTOEICPart2,
        3: ListeningTOEICPart3,
        4: ListeningTOEICPart4,
      },
      reading: {
        5: Question,
        6: Question,
        7: Question,
      },
    };

    const Model = modelMap[examType.toLowerCase()]?.[part];
    if (!Model) {
      req.flash('error', 'Loại đề hoặc phần thi không hợp lệ');
      return res.redirect('/admin/exam-parts/create');
    }

    const questions = await Model.find().select('questionNumber questionN paragraph questionText question passage questions');

    res.json({
      success: true,
      questions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách câu hỏi',
      error: error.message,
    });
  }
};