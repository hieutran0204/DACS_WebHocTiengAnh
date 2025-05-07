const ExamPartListening = require('../../models/TOEIC/ExamPart_Listening.model');

// Hiển thị danh sách các đề Listening TOEIC đã public
exports.getExamListeningList = async (req, res) => {
  try {
    const listeningExams = await ExamPartListening.find({ status: 'public' })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.render('client/pages/exam-listening-list', {
      examParts: listeningExams,
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' }
    });
  } catch (error) {
    console.error(error);
    res.render('client/pages/exam-listening-list', {
      examParts: [],
      error: 'Lỗi server khi lấy danh sách đề thi Listening'
    });
  }
};

// Hiển thị một đề Listening cụ thể để làm bài theo Part
exports.getPublicListeningExams = async (req, res) => {
  try {
    const { id } = req.params;
    const listeningExam = await ExamPartListening.findOne({ _id: id, status: 'public' })
      .populate({
        path: 'questions.questionId',
        select: 'questionText options audioUrl correctAnswer',
        refPath: 'questions.modelName'
      })
      .populate('createdBy', 'username')
      .lean();

    if (!listeningExam) {
      return res.render('client/pages/exam-listening', {
        examParts: [],
        error: 'Không tìm thấy đề thi hoặc đề thi chưa được public'
      });
    }

    // Nhóm câu hỏi theo Part (1, 2, 3, 4) từ modelName và xử lý subQuestionIndex
    const questionsByPart = listeningExam.questions.reduce((acc, q) => {
      if (q.questionId && q.questionId.options && Array.isArray(q.questionId.options) && q.modelName) {
        const part = parseInt(q.modelName.replace('ListeningTOEICPart', '')); // Lấy số part từ modelName
        if ([1, 2, 3, 4].includes(part)) {
          if (!acc[part]) acc[part] = [];
          acc[part].push({
            ...q,
            subQuestionIndex: q.subQuestionIndex || 0
          });
        }
      }
      return acc;
    }, {});

    // Sắp xếp câu hỏi theo subQuestionIndex (cho Part 3, 4)
    [3, 4].forEach(part => {
      if (questionsByPart[part]) {
        questionsByPart[part].sort((a, b) => a.subQuestionIndex - b.subQuestionIndex);
      }
    });

    const filteredExam = {
      ...listeningExam,
      questionsByPart
    };

    res.render('client/pages/exam-listening', {
      examParts: [filteredExam],
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' }
    });
  } catch (error) {
    console.error(error);
    res.render('client/pages/exam-listening', {
      examParts: [],
      error: 'Lỗi server khi lấy đề thi Listening'
    });
  }
};

// Xử lý nộp bài và chấm điểm
exports.submitListeningExam = async (req, res) => {
  try {
    const { examPartId, answers } = req.body;

    const examPart = await ExamPartListening.findById(examPartId)
      .populate({
        path: 'questions.questionId',
        select: 'correctAnswer',
        refPath: 'questions.modelName'
      })
      .lean();

    if (!examPart) {
      return res.render('client/pages/exam-listening', {
        examParts: [],
        error: 'Không tìm thấy đề thi'
      });
    }

    let score = 0;
    const totalQuestions = examPart.questions.length;
    const userAnswers = Object.values(answers).map(Number);

    examPart.questions.forEach((question, index) => {
      if (question.questionId && userAnswers[index] === question.questionId.correctAnswer) {
        score++;
      }
    });

    const percentage = (score / totalQuestions) * 100;

    res.render('client/pages/exam-result', {
      score,
      totalQuestions,
      percentage,
      examType: 'Listening'
    });
  } catch (error) {
    console.error(error);
    res.render('client/pages/exam-listening', {
      examParts: [],
      error: 'Lỗi server khi chấm điểm'
    });
  }
};