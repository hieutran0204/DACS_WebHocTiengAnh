const ExamPartReading = require('../../models/TOEIC/ExamPart_Reading.model');

// Hiển thị danh sách các đề Reading TOEIC đã public
exports.getExamReadingList = async (req, res) => {
  try {
    const readingExams = await ExamPartReading.find({ status: 'public' })
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .lean();

    res.render('client/pages/exam-reading-list', {
      examParts: readingExams,
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' }
    });
  } catch (error) {
    console.error(error);
    res.render('client/pages/exam-reading-list', {
      examParts: [],
      error: 'Lỗi server khi lấy danh sách đề thi Reading'
    });
  }
};

// Hiển thị một đề Reading cụ thể để làm bài theo Part
exports.getPublicReadingExams = async (req, res) => {
  try {
    const { id } = req.params;
    const readingExam = await ExamPartReading.findOne({ _id: id, status: 'public' })
      .populate('questions.questionId', 'questionText options correctAnswer part')
      .populate('createdBy', 'username')
      .lean();

    if (!readingExam) {
      return res.render('client/pages/exam-reading', {
        examParts: [],
        error: 'Không tìm thấy đề thi hoặc đề thi chưa được public'
      });
    }

    // Nhóm câu hỏi theo Part (5, 6, 7) từ dữ liệu questionId.part
    const questionsByPart = readingExam.questions.reduce((acc, q) => {
      if (q.questionId && q.questionId.options && Array.isArray(q.questionId.options) && q.questionId.part) {
        const part = q.questionId.part;
        if ([5, 6, 7].includes(part)) {
          if (!acc[part]) acc[part] = [];
          acc[part].push(q);
        }
      }
      return acc;
    }, {});

    const filteredExam = {
      ...readingExam,
      questionsByPart
    };

    res.render('client/pages/exam-reading', {
      examParts: [filteredExam],
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' }
    });
  } catch (error) {
    console.error(error);
    res.render('client/pages/exam-reading', {
      examParts: [],
      error: 'Lỗi server khi lấy đề thi Reading'
    });
  }
};

// Xử lý nộp bài và chấm điểm
exports.submitReadingExam = async (req, res) => {
  try {
    const { examPartId, answers } = req.body;

    const examPart = await ExamPartReading.findById(examPartId)
      .populate('questions.questionId', 'correctAnswer')
      .lean();

    if (!examPart) {
      return res.render('client/pages/exam-reading', {
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
      examType: 'Reading'
    });
  } catch (error) {
    console.error(error);
    res.render('client/pages/exam-reading', {
      examParts: [],
      error: 'Lỗi server khi chấm điểm'
    });
  }
};