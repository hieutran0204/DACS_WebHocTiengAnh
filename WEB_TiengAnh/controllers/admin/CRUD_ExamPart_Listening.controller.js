const ExamPart_Listening = require('../../models/TOEIC/ExamPart_Listening.model');
const { ListeningTOEICPart1, ListeningTOEICPart2, ListeningTOEICPart3, ListeningTOEICPart4 } = require('../../models/TOEIC/listeningTOEIC.model');

// Ánh xạ model
const modelMap = {
  ListeningTOEICPart1: ListeningTOEICPart1,
  ListeningTOEICPart2: ListeningTOEICPart2,
  ListeningTOEICPart3: ListeningTOEICPart3,
  ListeningTOEICPart4: ListeningTOEICPart4
};

// Hiển thị danh sách đề thi Listening
exports.getAllExamParts = async (req, res) => {
  try {
    const examParts = await ExamPart_Listening.find()
      .populate('createdBy', 'username')
      .lean();

    const populatedExamParts = await Promise.all(examParts.map(async (examPart) => {
      const questions = await Promise.all(examPart.questions.map(async (q) => {
        const Model = modelMap[q.modelName];
        if (!Model) return null;

        let question = await Model.findById(q.questionId)
          .select('part questionNumber questionText paragraph audioUrl imageUrl transcript questions options correctAnswer explanation')
          .lean();

        if (q.modelName === 'ListeningTOEICPart3' || q.modelName === 'ListeningTOEICPart4') {
          if (q.subQuestionIndex !== undefined && question?.questions?.[q.subQuestionIndex]) {
            const subQuestion = question.questions[q.subQuestionIndex];
            question = {
              ...question,
              question: subQuestion.text,
              options: subQuestion.options,
              correctAnswer: subQuestion.correctAnswer,
              explanation: subQuestion.explanation
            };
          } else {
            return null;
          }
        }

        return question;
      }));

      return {
        ...examPart,
        questions: questions.map((question, index) => ({
          questionId: question,
          modelName: examPart.questions[index].modelName,
          subQuestionIndex: examPart.questions[index].subQuestionIndex
        }))
      };
    }));

    res.render('admin/pages/TOEIC/exam-list-listening', {
      examParts: populatedExamParts,
      success: req.flash('success'),
      error: req.flash('error'),
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' },
      statusMap: { draft: 'Bản nháp', public: 'Công khai' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy danh sách đề thi Listening');
    res.render('admin/pages/TOEIC/exam-list-listening', { examParts: [], error: req.flash('error') });
  }
};

// Hiển thị form tạo đề thi Listening
exports.showCreateForm = async (req, res) => {
  try {
    const questions = [];

    // Lấy câu hỏi từ Part 1
    const part1Questions = await ListeningTOEICPart1.find()
      .select('part questionNumber questionText')
      .lean();
    questions.push(...part1Questions.map(q => ({ ...q, modelName: 'ListeningTOEICPart1' })));

    // Lấy câu hỏi từ Part 2
    const part2Questions = await ListeningTOEICPart2.find()
      .select('part questionNumber questionText')
      .lean();
    questions.push(...part2Questions.map(q => ({ ...q, modelName: 'ListeningTOEICPart2' })));

    // Lấy câu hỏi từ Part 3
    const part3Questions = await ListeningTOEICPart3.find()
      .select('part questionNumber questions')
      .lean();
    part3Questions.forEach(q => {
      if (q.questions && Array.isArray(q.questions)) {
        q.questions.forEach((subQ, index) => {
          questions.push({
            _id: q._id,
            part: q.part,
            questionNumber: q.questionNumber,
            text: subQ.text,
            subQuestionIndex: index,
            modelName: 'ListeningTOEICPart3'
          });
        });
      }
    });

    // Lấy câu hỏi từ Part 4
    const part4Questions = await ListeningTOEICPart4.find()
      .select('part questionNumber questions')
      .lean();
    part4Questions.forEach(q => {
      if (q.questions && Array.isArray(q.questions)) {
        q.questions.forEach((subQ, index) => {
          questions.push({
            _id: q._id,
            part: q.part,
            questionNumber: q.questionNumber,
            text: subQ.text,
            subQuestionIndex: index,
            modelName: 'ListeningTOEICPart4'
          });
        });
      }
    });

    res.render('admin/pages/TOEIC/create-exam-listening', {
      questions,
      success: req.flash('success'),
      error: req.flash('error')
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy danh sách câu hỏi');
    res.render('admin/pages/TOEIC/create-exam-listening', {
      questions: [],
      error: req.flash('error')
    });
  }
};

// Tạo đề thi Listening
exports.createExamPart = async (req, res) => {
  try {
    const { parts, questionIds } = req.body;
    const adminId = req.user._id;

    if (!parts || !questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      req.flash('error', 'Vui lòng chọn ít nhất một phần và một câu hỏi');
      return res.redirect('/admin/TOEIC/exam-listening/create');
    }

    const partArray = Array.isArray(parts) ? parts.map(Number) : [Number(parts)];
    if (!partArray.every(p => [1, 2, 3, 4].includes(p))) {
      req.flash('error', 'Phần thi không hợp lệ, chỉ hỗ trợ Part 1, 2, 3, 4');
      return res.redirect('/admin/TOEIC/exam-listening/create');
    }

    let examQuestions = [];
    let difficulties = [];

    for (const qId of questionIds) {
      const [questionId, subQuestionIndexStr] = qId.split('-');
      const subQuestionIndex = subQuestionIndexStr ? parseInt(subQuestionIndexStr) : undefined;

      const part = partArray.find(p => {
        const Model = modelMap[`ListeningTOEICPart${p}`];
        return Model && (p === 1 || p === 2 || (p === 3 && subQuestionIndex !== undefined) || (p === 4 && subQuestionIndex !== undefined));
      });

      if (!part) continue;

      const Model = modelMap[`ListeningTOEICPart${part}`];
      const question = await Model.findById(questionId).lean();

      if (!question) {
        console.warn(`Câu hỏi ${questionId} không tồn tại`);
        continue;
      }

      if (part === 3 || part === 4) {
        if (question.questions && Array.isArray(question.questions) && question.questions[subQuestionIndex]) {
          examQuestions.push({
            questionId: question._id,
            modelName: `ListeningTOEICPart${part}`,
            subQuestionIndex
          });
          difficulties.push(question.questions[subQuestionIndex].difficulty || question.difficulty || 0);
        }
      } else {
        examQuestions.push({
          questionId: question._id,
          modelName: `ListeningTOEICPart${part}`
        });
        difficulties.push(question.difficulty || 0);
      }
    }

    if (examQuestions.length === 0) {
      req.flash('error', 'Không có câu hỏi hợp lệ được chọn');
      return res.redirect('/admin/TOEIC/exam-listening/create');
    }

    const avgDifficulty = difficulties.length ? difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length : 0;

    const examPart = new ExamPart_Listening({
      examType: 'Listening',
      part: partArray,
      questions: examQuestions,
      createdBy: adminId,
      difficulty: Math.round(avgDifficulty)
    });

    await examPart.save();
    req.flash('success', `Tạo đề thi Listening thành công`);
    res.redirect('/admin/TOEIC/exam-listening');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi tạo đề thi Listening');
    res.redirect('/admin/TOEIC/exam-listening/create');
  }
};

// Hiển thị chi tiết đề thi Listening
exports.showExamPartDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const examPart = await ExamPart_Listening.findById(id)
      .populate('createdBy', 'username')
      .lean();

    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/admin/TOEIC/exam-listening');
    }

    const questions = await Promise.all(examPart.questions.map(async (q) => {
      const Model = modelMap[q.modelName];
      if (!Model) return null;

      let question = await Model.findById(q.questionId)
        .select('part questionNumber questionText paragraph audioUrl imageUrl transcript questions options correctAnswer explanation')
        .lean();

      if (!question) return null;

      if (q.modelName === 'ListeningTOEICPart3' || q.modelName === 'ListeningTOEICPart4') {
        if (q.subQuestionIndex !== undefined && question.questions?.[q.subQuestionIndex]) {
          const subQuestion = question.questions[q.subQuestionIndex];
          question = {
            ...question,
            question: subQuestion.text,
            options: subQuestion.options,
            correctAnswer: subQuestion.correctAnswer,
            explanation: subQuestion.explanation
          };
        } else {
          return null;
        }
      }

      return question;
    }));

    const questionsByPart = {};
    questions.forEach((question, index) => {
      if (question) {
        const partKey = `Listening TOEIC Part ${question.part}`;
        if (!questionsByPart[partKey]) {
          questionsByPart[partKey] = [];
        }
        questionsByPart[partKey].push({
          ...question,
          modelName: examPart.questions[index].modelName,
          subQuestionIndex: examPart.questions[index].subQuestionIndex
        });
      }
    });

    for (const partKey in questionsByPart) {
      questionsByPart[partKey].sort((a, b) => (a.questionNumber || 0) - (b.questionNumber || 0));
    }

    res.render('admin/pages/TOEIC/exam-detail-listening', {
      examPart,
      questionsByPart,
      statusMap: { draft: 'Bản nháp', public: 'Công khai' },
      difficultyMap: { 0: 'Dễ', 1: 'Trung bình', 2: 'Khó' }
    });
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi lấy chi tiết đề thi Listening');
    res.redirect('/admin/TOEIC/exam-listening');
  }
};

// Xóa đề thi Listening
exports.deleteExamPart = async (req, res) => {
  try {
    const { id } = req.params;
    const examPart = await ExamPart_Listening.findByIdAndDelete(id);

    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi để xóa');
      return res.redirect('/admin/TOEIC/exam-listening');
    }

    req.flash('success', 'Xóa đề thi Listening thành công');
    res.redirect('/admin/TOEIC/exam-listening');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi xóa đề thi Listening');
    res.redirect('/admin/TOEIC/exam-listening');
  }
};
exports.publishExamPart = async (req, res) => {
  try {
    const { id } = req.params;

    const examPart = await ExamPart_Listening.findById(id);
    if (!examPart) {
      req.flash('error', 'Không tìm thấy đề thi');
      return res.redirect('/admin/TOEIC/exam-listening');
    }

    examPart.status = 'public';
    await examPart.save();

    req.flash('success', 'Đề thi đã được công khai thành công');
    res.redirect('/admin/TOEIC/exam-listening');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Lỗi server khi công khai đề thi');
    res.redirect('/admin/TOEIC/exam-listening');
  }
};