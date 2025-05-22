const ExamPartReading = require('../../models/TOEIC/ExamPart_Reading.model');
const Question = require('../../models/TOEIC/readingToiec.model');

// Hiển thị danh sách các đề Reading TOEIC đã public
exports.getExamReadingList = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const readingExams = await ExamPartReading.find({ status: 'public' })
      .select('part difficulty createdAt createdBy')
      .populate('createdBy', 'username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    if (!readingExams.length) {
      console.log('Không có đề thi Reading nào với status: public');
    }

    const total = await ExamPartReading.countDocuments({ status: 'public' });

    res.render('client/pages/exam-reading-list', {
      examParts: readingExams,
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      error: null
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đề thi Reading:', error);
    res.render('client/pages/exam-reading-list', {
      examParts: [],
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
      page: 1,
      limit: 10,
      total: 0,
      error: 'Lỗi server khi lấy danh sách đề thi Reading'
    });
  }
};

// Hiển thị một đề Reading cụ thể để làm bài, nhóm theo Part
exports.getPublicReadingExams = async (req, res) => {
  try {
    const { id } = req.params;

    const readingExam = await ExamPartReading.findOne({ _id: id, status: 'public' })
      .populate({
        path: 'questions.questionId',
        select: 'part questionN question options correctAnswer passage blanks questions Img'
      })
      .populate('createdBy', 'username')
      .lean();

    if (!readingExam) {
      console.log(`Không tìm thấy đề thi với id: ${id} hoặc status không phải public`);
      return res.render('client/pages/exam-reading', {
        examPart: null,
        questionsByPart: {},
        difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
        error: 'Không tìm thấy đề thi hoặc đề thi chưa được public'
      });
    }

    // Kiểm tra populate
    if (readingExam.questions.some(q => !q.questionId)) {
      console.error('Lỗi populate: Một số questionId không tồn tại trong Reading_TOEIC');
    }

    // Nhóm câu hỏi theo Part (5, 6, 7)
    const questionsByPart = {};
    readingExam.questions.forEach((q) => {
      if (q.questionId) {
        const part = q.questionId.part;
        const partKey = `Part ${part}`;
        if (!questionsByPart[partKey]) questionsByPart[partKey] = [];

        if (part === 6) {
          // Part 6: Tạo câu hỏi cho mỗi blank
          q.questionId.blanks.forEach((blank, blankIndex) => {
            questionsByPart[partKey].push({
              questionId: q.questionId._id,
              part,
              questionN: q.questionId.questionN,
              passage: q.questionId.passage,
              Img: q.questionId.Img,
              questionText: `Blank ${blank.blank}`,
              options: blank.options,
              blankIndex
            });
          });
        } else if (part === 7) {
          // Part 7: Tạo câu hỏi cho mỗi sub-question
          q.questionId.questions.forEach((subQuestion, subQuestionIndex) => {
            questionsByPart[partKey].push({
              questionId: q.questionId._id,
              part,
              questionN: q.questionId.questionN,
              passage: q.questionId.passage,
              Img: q.questionId.Img,
              questionText: subQuestion.question,
              options: subQuestion.options,
              subQuestionIndex
            });
          });
        } else {
          // Part 5: Câu hỏi đơn
          questionsByPart[partKey].push({
            questionId: q.questionId._id,
            part,
            questionN: q.questionId.questionN,
            questionText: q.questionId.question,
            options: q.questionId.options,
            Img: q.questionId.Img
          });
        }
      }
    });

    // Sắp xếp câu hỏi theo questionN và blankIndex/subQuestionIndex
    for (const partKey in questionsByPart) {
      questionsByPart[partKey].sort((a, b) => {
        if (a.questionN === b.questionN) {
          return (a.blankIndex || a.subQuestionIndex || 0) - (b.blankIndex || b.subQuestionIndex || 0);
        }
        return a.questionN - b.questionN;
      });
    }

    res.render('client/pages/exam-reading', {
      examPart: readingExam,
      questionsByPart,
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
      error: null
    });
  } catch (error) {
    console.error('Lỗi khi lấy đề thi Reading:', error);
    res.render('client/pages/exam-reading', {
      examPart: null,
      questionsByPart: {},
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
      error: 'Lỗi server khi lấy đề thi Reading'
    });
  }
};

// Xử lý nộp bài và chấm điểm
exports.submitReadingExam = async (req, res) => {
  try {
    const { examPartId, answers } = req.body;

    if (!examPartId || !answers) {
      console.log('Dữ liệu nộp bài không đầy đủ:', { examPartId, answers });
      return res.render('client/pages/exam-reading', {
        examPart: null,
        questionsByPart: {},
        error: 'Dữ liệu nộp bài không hợp lệ'
      });
    }

    const examPart = await ExamPartReading.findById(examPartId)
      .populate({
        path: 'questions.questionId',
        select: 'part questionN question correctAnswer blanks questions'
      })
      .lean();

    if (!examPart) {
      console.log(`Không tìm thấy đề thi với id: ${examPartId}`);
      return res.render('client/pages/exam-reading', {
        examPart: null,
        questionsByPart: {},
        error: 'Không tìm thấy đề thi'
      });
    }

    let score = 0;
    let totalQuestions = 0;
    const results = [];

    examPart.questions.forEach((q) => {
      if (!q.questionId) return;

      if (q.questionId.part === 6) {
        // Part 6: Chấm điểm cho mỗi blank
        q.questionId.blanks.forEach((blank, blankIndex) => {
          const key = `${q.questionId._id}-${blankIndex}`;
          const userAnswer = answers[key];
          const correctAnswer = blank.correctAnswer;
          const isCorrect = userAnswer && userAnswer === correctAnswer;
          if (isCorrect) score++;
          totalQuestions++;

          results.push({
            questionId: q.questionId._id,
            blankIndex,
            questionN: q.questionId.questionN,
            questionText: `Blank ${blank.blank}`,
            userAnswer: userAnswer || 'Không chọn',
            correctAnswer,
            isCorrect
          });
        });
      } else if (q.questionId.part === 7) {
        // Part 7: Chấm điểm cho mỗi sub-question
        q.questionId.questions.forEach((subQuestion, subQuestionIndex) => {
          const key = `${q.questionId._id}-${subQuestionIndex}`;
          const userAnswer = answers[key];
          const correctAnswer = subQuestion.correctAnswer;
          const isCorrect = userAnswer && userAnswer === correctAnswer;
          if (isCorrect) score++;
          totalQuestions++;

          results.push({
            questionId: q.questionId._id,
            subQuestionIndex,
            questionN: q.questionId.questionN,
            questionText: subQuestion.question,
            userAnswer: userAnswer || 'Không chọn',
            correctAnswer,
            isCorrect
          });
        });
      } else {
        // Part 5: Chấm điểm câu hỏi đơn
        const key = `${q.questionId._id}-0`;
        const userAnswer = answers[key];
        const correctAnswer = q.questionId.correctAnswer;
        const isCorrect = userAnswer && userAnswer === correctAnswer;
        if (isCorrect) score++;
        totalQuestions++;

        results.push({
          questionId: q.questionId._id,
          questionN: q.questionId.questionN,
          questionText: q.questionId.question,
          userAnswer: userAnswer || 'Không chọn',
          correctAnswer,
          isCorrect
        });
      }
    });

    const percentage = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    res.render('client/pages/exam-result', {
      score,
      totalQuestions,
      percentage,
      results,
      examType: 'Reading',
      examPart,
      error: null
    });
  } catch (error) {
    console.error('Lỗi khi chấm điểm:', error);
    res.render('client/pages/exam-reading', {
      examPart: null,
      questionsByPart: {},
      error: 'Lỗi server khi chấm điểm'
    });
  }
};