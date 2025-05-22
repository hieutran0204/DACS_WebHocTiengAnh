const ExamPartListening = require('../../models/TOEIC/ExamPart_Listening.model');
const {
  ListeningTOEICPart1,
  ListeningTOEICPart2,
  ListeningTOEICPart3,
  ListeningTOEICPart4
} = require('../../models/TOEIC/listeningTOEIC.model');

// Ánh xạ model theo modelName
const modelMap = {
  ListeningTOEICPart1,
  ListeningTOEICPart2,
  ListeningTOEICPart3,
  ListeningTOEICPart4
};

// Hiển thị danh sách các đề Listening TOEIC đã public
exports.getExamListeningList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const listeningExams = await ExamPartListening.find({ status: 'public' })
      .select('part difficulty createdAt createdBy')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await ExamPartListening.countDocuments({ status: 'public' });

    res.render('client/pages/exam-listening-list', {
      examParts: listeningExams,
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
      page: parseInt(page),
      limit: parseInt(limit),
      total
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề thi Listening:', error);
    res.render('client/pages/exam-listening-list', {
      examParts: [],
      error: 'Lỗi server khi lấy danh sách đề thi Listening'
    });
  }
};

// Hiển thị một đề Listening cụ thể để làm bài, nhóm theo Part
exports.getPublicListeningExams = async (req, res) => {
  try {
    const { id } = req.params;

    const listeningExam = await ExamPartListening.findOne({ _id: id, status: 'public' })
      .populate({
        path: 'questions.questionId',
        select: 'part questionNumber questionText paragraph audioUrl imageUrl transcript diagramUrl questions options correctAnswer',
        refPath: 'questions.modelName'
      })
      .populate('createdBy', 'username')
      .lean();

    if (!listeningExam) {
      return res.render('client/pages/exam-listening', {
        examPart: null,
        questionsByPart: {},
        error: 'Không tìm thấy đề thi hoặc đề thi chưa được public'
      });
    }

    // Nhóm câu hỏi theo Part (1, 2, 3, 4)
    const questionsByPart = {};
    listeningExam.questions.forEach((q) => {
      if (q.questionId && q.modelName) {
        const part = q.questionId.part;
        const partKey = `Part ${part}`;
        if (!questionsByPart[partKey]) questionsByPart[partKey] = [];

        let questionData;
        if (q.modelName === 'ListeningTOEICPart3' || q.modelName === 'ListeningTOEICPart4') {
          if (q.subQuestionIndex !== undefined && q.questionId.questions?.[q.subQuestionIndex]) {
            const subQuestion = q.questionId.questions[q.subQuestionIndex];
            questionData = {
              questionId: q.questionId._id,
              part,
              questionNumber: q.questionId.questionNumber,
              questionText: subQuestion.text,
              options: subQuestion.options,
              audioUrl: q.questionId.audioUrl,
              transcript: q.questionId.transcript,
              diagramUrl: q.questionId.diagramUrl,
              subQuestionIndex: q.subQuestionIndex
            };
          } else {
            return; // Bỏ qua nếu subQuestion không hợp lệ
          }
        } else {
          questionData = {
            questionId: q.questionId._id,
            part,
            questionNumber: q.questionId.questionNumber,
            questionText: q.questionId.questionText || q.questionId.paragraph,
            options: q.questionId.options,
            audioUrl: q.questionId.audioUrl,
            imageUrl: q.questionId.imageUrl,
            transcript: q.questionId.transcript
          };
        }
        questionsByPart[partKey].push(questionData);
      }
    });

    // Sắp xếp câu hỏi theo questionNumber và subQuestionIndex
    for (const partKey in questionsByPart) {
      questionsByPart[partKey].sort((a, b) => {
        if (a.questionNumber === b.questionNumber) {
          return (a.subQuestionIndex || 0) - (b.subQuestionIndex || 0);
        }
        return a.questionNumber - b.questionNumber;
      });
    }

    res.render('client/pages/exam-listening', {
      examPart: listeningExam,
      questionsByPart,
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' }
    });
  } catch (error) {
    console.error('Lỗi khi lấy đề thi Listening:', error);
    res.render('client/pages/exam-listening', {
      examPart: null,
      questionsByPart: {},
      error: 'Lỗi server khi lấy đề thi Listening'
    });
  }
};

// Xử lý nộp bài và chấm điểm
exports.submitListeningExam = async (req, res) => {
  try {
    const { examPartId, answers } = req.body; // answers: { "questionId-subQuestionIndex": "A" }

    const examPart = await ExamPartListening.findById(examPartId)
      .populate({
        path: 'questions.questionId',
        select: 'part questionNumber questions correctAnswer',
        refPath: 'questions.modelName'
      })
      .lean();

    if (!examPart) {
      return res.render('client/pages/exam-listening', {
        examPart: null,
        questionsByPart: {},
        error: 'Không tìm thấy đề thi'
      });
    }

    let score = 0;
    const totalQuestions = examPart.questions.length;
    const results = [];

    examPart.questions.forEach((q) => {
      if (!q.questionId) return;

      const key = q.subQuestionIndex !== undefined
        ? `${q.questionId._id}-${q.subQuestionIndex}`
        : `${q.questionId._id}-0`;
      const userAnswer = answers[key];

      let correctAnswer;
      if (q.modelName === 'ListeningTOEICPart3' || q.modelName === 'ListeningTOEICPart4') {
        correctAnswer = q.questionId.questions?.[q.subQuestionIndex]?.correctAnswer;
      } else {
        correctAnswer = q.questionId.correctAnswer;
      }

      const isCorrect = userAnswer && userAnswer === correctAnswer;
      if (isCorrect) score++;

      results.push({
        questionId: q.questionId._id,
        subQuestionIndex: q.subQuestionIndex || 0,
        questionNumber: q.questionId.questionNumber,
        userAnswer: userAnswer || 'Không chọn',
        correctAnswer,
        isCorrect
      });
    });

    const percentage = (score / totalQuestions) * 100;

    res.render('client/pages/exam-result', {
      score,
      totalQuestions,
      percentage,
      results,
      examType: 'Listening',
      examPart
    });
  } catch (error) {
    console.error('Lỗi khi chấm điểm:', error);
    res.render('client/pages/exam-listening', {
      examPart: null,
      questionsByPart: {},
      error: 'Lỗi server khi chấm điểm'
    });
  }
};