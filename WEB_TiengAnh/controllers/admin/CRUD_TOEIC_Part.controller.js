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
      .populate('createdBy', 'username')
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
    res.render('admin/pages/TOEIC/exam-list-Toeic', { examParts: [] });
  }
};

// Hiển thị form tạo đề thi
exports.showCreateForm = (req, res) => {
  res.render('admin/pages/TOEIC/create-exam', {
    success: req.flash('success'),
    error: req.flash('error'),
  });
};

// Tạo đề thi thủ công
exports.createExamPart = async (req, res) => {
  try {
    const { examType, part, questionIds } = req.body;
    const adminId = req.user._id;

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
      return res.redirect('/admin/exam/create');
    }

    const questions = await Model.find({ _id: { $in: questionIds } });
    if (questions.length !== questionIds.length) {
      req.flash('error', 'Một số câu hỏi không tồn tại');
      return res.redirect('/admin/exam/create');
    }

    const examQuestions = questionIds.map(id => ({
      questionId: id,
      modelName: Model.modelName,
    }));

    const avgDifficulty = questions.reduce((sum, q) => sum + (q.difficulty || 0), 0) / questions.length;

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

// Tạo đề thi ngẫu nhiên
exports.generateRandomExamPart = async (req, res) => {
  try {
    const { examType, parts, difficulty, questionCount, minTopic, maxTopic } = req.body;
    const adminId = req.user._id;

    if (!examType || !parts || !questionCount) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ thông tin: loại đề, phần thi, và số lượng câu hỏi',
      });
    }

    const selectedParts = Array.isArray(parts) ? parts : [parts];
    const numQuestions = parseInt(questionCount);

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

    const examParts = [];
    for (const part of selectedParts) {
      const Model = modelMap[examType]?.[part];
      if (!Model) {
        return res.status(400).json({
          success: false,
          message: `Phần thi ${part} không hợp lệ cho loại đề ${examType}`,
        });
      }

      let query = {};
      if (difficulty) query.difficulty = parseInt(difficulty);
      if (minTopic && maxTopic) {
        query.TopicN = { $gte: parseInt(minTopic), $lte: parseInt(maxTopic) };
      }

      const questions = await Model.aggregate([
        { $match: query },
        { $sample: { size: Math.ceil(numQuestions / selectedParts.length) } },
      ]);

      if (questions.length === 0) {
        return res.status(400).json({
          success: false,
          message: `Không có câu hỏi nào phù hợp cho Part ${part}`,
        });
      }

      const examQuestions = questions.map(q => ({
        questionId: q._id,
        modelName: Model.modelName,
      }));

      const avgDifficulty = questions.reduce((sum, q) => sum + (q.difficulty || 0), 0) / questions.length;

      const examPart = new ExamPart({
        examType,
        part,
        questions: examQuestions,
        createdBy: adminId,
        difficulty: Math.round(avgDifficulty),
      });

      await examPart.save();
      examParts.push(examPart);
    }

    const examCode = `EXAM-${Date.now()}`;
    return res.json({
      success: true,
      examCode,
      examId: examParts[0]._id,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo đề thi ngẫu nhiên',
      error: error.message,
    });
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

    res.render('admin/pages/TOEIC/edit', {
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

      const avgDifficulty = questions.reduce((sum, q) => sum + (q.difficulty || 0), 0) / questions.length;
      examPart.difficulty = Math.round(avgDifficulty);
    }

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
      return res.status(400).json({
        success: false,
        message: 'Loại đề hoặc phần thi không hợp lệ',
      });
    }

    const questions = await Model.find().select('questionNumber questionN paragraph questionText question passage questions');

    res.status(200).json({
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