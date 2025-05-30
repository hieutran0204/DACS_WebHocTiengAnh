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

    console.log('Danh sách đề thi:', readingExams);

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
      error: 'Lỗi server khi lấy danh sách đề thi Reading.'
    });
  }
};

// Hiển thị một đề Reading cụ thể để làm bài, nhóm theo Part
exports.getPublicReadingExams = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`=== Bắt đầu lấy đề thi ID: ${id} ===`);

    const readingExam = await ExamPartReading.findOne({ _id: id, status: 'public' })
      .populate({
        path: 'questions.questionId',
        model: 'Question',
        select: 'part questionN question options correctAnswer passage blanks questions Img'
      })
      .populate('createdBy', 'username')
      .lean();

    if (!readingExam) {
      console.error(`Không tìm thấy đề thi với ID: ${id} hoặc status không public`);
      return res.render('client/pages/exam-reading', {
        examPart: null,
        questionsByPart: {},
        difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
        error: 'Không tìm thấy đề thi hoặc đề thi chưa được public.'
      });
    }

    console.log('Đề thi:', JSON.stringify(readingExam, null, 2));

    if (!readingExam.questions || !Array.isArray(readingExam.questions)) {
      console.error('Dữ liệu questions không hợp lệ:', readingExam.questions);
      return res.render('client/pages/exam-reading', {
        examPart: readingExam,
        questionsByPart: {},
        difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
        error: 'Dữ liệu câu hỏi không hợp lệ.'
      });
    }

    const questionsByPart = {};

    // Xử lý Part 5
    console.log('--- Xử lý Part 5 ---');
    let part5Counter = 0;
    readingExam.questions.forEach((q, index) => {
      if (!q.questionId) {
        console.warn(`Câu hỏi ${index + 1} không có questionId:`, q);
        return;
      }

      const part = q.questionId.part;
      const partKey = `Part ${part}`;
      if (!questionsByPart[partKey]) questionsByPart[partKey] = [];

      if (part === 5) {
        part5Counter++;
        if (!q.questionId.question || !q.questionId.options || !Array.isArray(q.questionId.options) || q.questionId.options.length !== 4) {
          console.warn(`Câu hỏi Part 5 (questionN: ${q.questionId.questionN}) không hợp lệ:`, q.questionId);
          questionsByPart[partKey].push({
            questionId: q.questionId._id,
            part,
            questionN: q.questionId.questionN,
            questionText: 'Không có nội dung câu hỏi',
            options: ['A', 'B', 'C', 'D'],
            type: 'question',
            displayNumber: part5Counter
          });
          return;
        }
        questionsByPart[partKey].push({
          questionId: q.questionId._id,
          part,
          questionN: q.questionId.questionN,
          questionText: q.questionId.question,
          options: q.questionId.options,
          type: 'question',
          displayNumber: part5Counter
        });
      }
    });

    // Xử lý Part 6
    console.log('--- Xử lý Part 6 ---');
    const part6Groups = {};
    let part6MainCounter = 0;
    readingExam.questions.forEach((q, index) => {
      if (!q.questionId) {
        console.warn(`Câu hỏi ${index + 1} không có questionId:`, q);
        return;
      }

      const part = q.questionId.part;
      if (part !== 6) return;

      const partKey = `Part ${part}`;
      if (!questionsByPart[partKey]) questionsByPart[partKey] = [];

      const questionIdStr = q.questionId._id.toString();
      if (!part6Groups[questionIdStr]) {
        part6MainCounter++;
        part6Groups[questionIdStr] = {
          passage: {
            questionId: q.questionId._id,
            part,
            questionN: q.questionId.questionN,
            passage: q.questionId.passage || 'Không có đoạn văn',
            Img: q.questionId.Img || '',
            type: 'passage',
            displayNumber: part6MainCounter
          },
          questions: []
        };
      }

      // Xử lý blanks (hỗ trợ cả 'blanks' và 'questions')
      const blanks = q.questionId.blanks && Array.isArray(q.questionId.blanks) && q.questionId.blanks.length > 0
        ? q.questionId.blanks
        : q.questionId.questions && Array.isArray(q.questionId.questions) && q.questionId.questions.length > 0
          ? q.questionId.questions
          : [];

      if (blanks.length > 0) {
        blanks.forEach((blank, blankIndex) => {
          if (!blank.options || !Array.isArray(blank.options) || blank.options.length !== 4) {
            console.warn(`Blank ${blankIndex + 1} (questionN: ${q.questionId.questionN}) không hợp lệ:`, blank);
            return;
          }
          part6Groups[questionIdStr].questions.push({
            questionId: q.questionId._id,
            part,
            questionN: q.questionId.questionN,
            questionText: `Điền vào chỗ trống ${blank.blank || blankIndex + 1}`,
            options: blank.options,
            blankIndex,
            type: 'question',
            displayNumber: `${part6MainCounter}.${blankIndex + 1}`
          });
        });
      } else {
        console.warn(`Câu hỏi Part 6 (questionN: ${q.questionId.questionN}) không có blanks/questions hợp lệ`);
        part6Groups[questionIdStr].questions.push({
          questionId: q.questionId._id,
          part,
          questionN: q.questionId.questionN,
          questionText: 'Không có chỗ trống nào được định nghĩa',
          options: ['A', 'B', 'C', 'D'],
          blankIndex: 0,
          type: 'question',
          displayNumber: `${part6MainCounter}.1`
        });
      }
    });

    // Sắp xếp và thêm vào questionsByPart['Part 6']
    Object.values(part6Groups).sort((a, b) => a.passage.questionN - b.passage.questionN).forEach(group => {
      questionsByPart['Part 6'].push(group.passage);
      group.questions.sort((a, b) => a.blankIndex - b.blankIndex).forEach(q => {
        questionsByPart['Part 6'].push(q);
      });
    });

    // Xử lý Part 7
    console.log('--- Xử lý Part 7 ---');
    const part7Groups = {};
    let part7MainCounter = 0;
    readingExam.questions.forEach((q, index) => {
      if (!q.questionId) {
        console.warn(`Câu hỏi ${index + 1} không có questionId:`, q);
        return;
      }

      const part = q.questionId.part;
      if (part !== 7) return;

      const partKey = `Part ${part}`;
      if (!questionsByPart[partKey]) questionsByPart[partKey] = [];

      const questionIdStr = q.questionId._id.toString();
      if (!part7Groups[questionIdStr]) {
        part7MainCounter++;
        part7Groups[questionIdStr] = {
          passage: {
            questionId: q.questionId._id,
            part,
            questionN: q.questionId.questionN,
            passage: q.questionId.passage || 'Không có đoạn văn',
            Img: q.questionId.Img || '',
            type: 'passage',
            displayNumber: part7MainCounter
          },
          questions: []
        };
      }

      // Xử lý sub-questions
      if (q.questionId.questions && Array.isArray(q.questionId.questions) && q.questionId.questions.length > 0) {
        q.questionId.questions.forEach((subQuestion, subQuestionIndex) => {
          if (!subQuestion.question || !subQuestion.options || !Array.isArray(subQuestion.options) || subQuestion.options.length !== 4) {
            console.warn(`Sub-question ${subQuestionIndex + 1} (questionN: ${q.questionId.questionN}) không hợp lệ:`, subQuestion);
            return;
          }
          part7Groups[questionIdStr].questions.push({
            questionId: q.questionId._id,
            part,
            questionN: q.questionId.questionN,
            questionText: subQuestion.question,
            options: subQuestion.options,
            subQuestionIndex,
            type: 'question',
            displayNumber: `${part7MainCounter}.${subQuestionIndex + 1}`
          });
        });
      } else {
        console.warn(`Câu hỏi Part 7 (questionN: ${q.questionId.questionN}) không có sub-questions hợp lệ`);
        part7Groups[questionIdStr].questions.push({
          questionId: q.questionId._id,
          part,
          questionN: q.questionId.questionN,
          questionText: 'Không có câu hỏi nào được định nghĩa',
          options: ['A', 'B', 'C', 'D'],
          subQuestionIndex: 0,
          type: 'question',
          displayNumber: `${part7MainCounter}.1`
        });
      }
    });

    // Sắp xếp và thêm vào questionsByPart['Part 7']
    Object.values(part7Groups).sort((a, b) => a.passage.questionN - b.passage.questionN).forEach(group => {
      questionsByPart['Part 7'].push(group.passage);
      group.questions.sort((a, b) => a.subQuestionIndex - b.subQuestionIndex).forEach(q => {
        questionsByPart['Part 7'].push(q);
      });
    });

    console.log('=== questionsByPart cuối cùng: ===', JSON.stringify(questionsByPart, null, 2));

    // Thêm placeholder nếu thiếu Part
    if (!questionsByPart['Part 5'] && readingExam.part.includes(5)) {
      console.error('Part 5 không có câu hỏi nào');
      questionsByPart['Part 5'] = [{
        questionId: 'placeholder-part5',
        part: 5,
        questionN: 1,
        questionText: 'Không có câu hỏi cho Part 5 do lỗi dữ liệu.',
        options: ['A', 'B', 'C', 'D'],
        type: 'question',
        displayNumber: 1
      }];
    }
    if (!questionsByPart['Part 6'] && readingExam.part.includes(6)) {
      console.error('Part 6 không có câu hỏi nào');
      questionsByPart['Part 6'] = [{
        questionId: 'placeholder-part6',
        part: 6,
        questionN: 1,
        passage: 'Không có đoạn văn cho Part 6 do lỗi dữ liệu.',
        type: 'passage',
        displayNumber: 1
      }];
    }
    if (!questionsByPart['Part 7'] && readingExam.part.includes(7)) {
      console.error('Part 7 không có câu hỏi nào');
      questionsByPart['Part 7'] = [{
        questionId: 'placeholder-part7',
        part: 7,
        questionN: 1,
        passage: 'Không có đoạn văn cho Part 7 do lỗi dữ liệu.',
        type: 'passage',
        displayNumber: 1
      }];
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
      error: 'Lỗi server khi lấy đề thi Reading.'
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
        model: 'Question',
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

    if (!examPart.questions || !Array.isArray(examPart.questions)) {
      console.error('examPart.questions không hợp lệ:', examPart.questions);
      return res.render('client/pages/exam-reading', {
        examPart: null,
        questionsByPart: {},
        error: 'Dữ liệu câu hỏi không hợp lệ'
      });
    }

    let score = 0;
    let totalQuestions = 0;
    const results = [];

    examPart.questions.forEach((q) => {
      if (!q.questionId) {
        console.warn('Câu hỏi không có questionId:', q);
        return;
      }

      if (q.questionId.part === 5) {
        const key = `${q.questionId._id}-0`;
        const userAnswer = answers[key];
        const correctAnswer = q.questionId.correctAnswer;
        const isCorrect = userAnswer && userAnswer === correctAnswer;
        if (isCorrect) score++;
        totalQuestions++;

        results.push({
          questionId: q.questionId._id,
          questionN: q.questionId.questionN,
          questionText: q.questionId.question || 'Không có câu hỏi',
          userAnswer: userAnswer || 'Không chọn',
          correctAnswer,
          isCorrect
        });
      } else if (q.questionId.part === 6) {
        const blanks = q.questionId.blanks && Array.isArray(q.questionId.blanks) && q.questionId.blanks.length > 0
          ? q.questionId.blanks
          : q.questionId.questions && Array.isArray(q.questionId.questions) && q.questionId.questions.length > 0
            ? q.questionId.questions
            : [];

        if (blanks.length > 0) {
          blanks.forEach((blank, blankIndex) => {
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
              questionText: `Điền vào chỗ trống ${blank.blank || blankIndex + 1}`,
              userAnswer: userAnswer || 'Không chọn',
              correctAnswer,
              isCorrect
            });
          });
        }
      } else if (q.questionId.part === 7) {
        if (q.questionId.questions && Array.isArray(q.questionId.questions)) {
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
              questionText: subQuestion.question || 'Không có câu hỏi',
              userAnswer: userAnswer || 'Không chọn',
              correctAnswer,
              isCorrect
            });
          });
        }
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
      error: 'Lỗi server khi chấm điểm.'
    });
  }
};