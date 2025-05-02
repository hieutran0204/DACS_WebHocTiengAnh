const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { ListeningTOEICPart1, ListeningTOEICPart2, ListeningTOEICPart3, ListeningTOEICPart4 } = require('../../models/TOEIC/listeningTOEIC.model');

// Hàm hỗ trợ xóa file
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '../../public', filePath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

// Hàm chọn model dựa trên part
const getModelByPart = (part) => {
  switch (Number(part)) {
    case 1: return ListeningTOEICPart1;
    case 2: return ListeningTOEICPart2;
    case 3: return ListeningTOEICPart3;
    case 4: return ListeningTOEICPart4;
    default: throw new Error('Phần không hợp lệ');
  }
};

// Lấy tất cả câu hỏi nghe
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Promise.all([
      ListeningTOEICPart1.find().lean(),
      ListeningTOEICPart2.find().lean(),
      ListeningTOEICPart3.find().lean(),
      ListeningTOEICPart4.find().lean()
    ]).then(([part1, part2, part3, part4]) => {
      return [...part1, ...part2, ...part3, ...part4].sort((a, b) => {
        if (a.part === b.part) return a.questionNumber - b.questionNumber;
        return a.part - b.part;
      });
    });

    res.render('admin/pages/TOEIC/listening-list', { 
      questions,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" }
    });
  } catch (err) {
    res.status(500).send('Lỗi khi lấy câu hỏi: ' + err.message);
  }
};

// Hiển thị form tạo mới
exports.showCreateForm = (req, res) => {
  res.render('admin/pages/TOEIC/create-listening-question');
};

// Tạo câu hỏi nghe mới
exports.createListeningQuestion = async (req, res) => {
  console.log('Create request:', { body: req.body, files: req.files });
  try {
    const { 
      part, 
      paragraph, 
      questionText, 
      transcript, 
      questionNumber, 
      correctAnswer, 
      explanation,
      optionA, optionB, optionC, optionD,
      question1Text, question1OptionA, question1OptionB, question1OptionC, question1OptionD, question1CorrectAnswer, question1Explanation,
      question2Text, question2OptionA, question2OptionB, question2OptionC, question2OptionD, question2CorrectAnswer, question2Explanation,
      question3Text, question3OptionA, question3OptionB, question3OptionC, question3OptionD, question3CorrectAnswer, question3Explanation
    } = req.body;

    // Kiểm tra part và audio
    if (!part) {
      return res.status(400).send('Phần là bắt buộc');
    }
    if (!req.files?.audio) {
      return res.status(400).send('File audio là bắt buộc');
    }

    const Model = getModelByPart(part);
    const questionData = {
      part: Number(part),
      audioUrl: '/audio/listening/' + req.files.audio[0].filename,
      questionNumber: parseInt(questionNumber) || 1,
    };

    // Đảm bảo questionNumber nằm trong khoảng hợp lệ
    if (questionData.questionNumber < 1 || questionData.questionNumber > 100) {
      return res.status(400).send('Số câu hỏi phải từ 1 đến 100');
    }

    // Kiểm tra xem questionNumber có bị trùng trong part không
    const existingQuestion = await Model.findOne({
      part: questionData.part,
      questionNumber: questionData.questionNumber,
    });
    if (existingQuestion) {
      return res.status(400).send(`Số câu hỏi ${questionData.questionNumber} đã tồn tại trong Part ${part}`);
    }

    switch (Number(part)) {
      case 1:
        if (!paragraph || !paragraph.trim()) return res.status(400).send('Đoạn văn là bắt buộc');
        if (!req.files?.image) return res.status(400).send('Hình ảnh là bắt buộc cho Part 1');
        if (!optionA || !optionB || !optionC || !optionD) {
          return res.status(400).send('Part 1 phải có đúng 4 lựa chọn');
        }
        questionData.imageUrl = '/images/listening/' + req.files.image[0].filename;
        questionData.options = [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()];
        questionData.correctAnswer = correctAnswer?.toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(questionData.correctAnswer)) {
          return res.status(400).send('Đáp án đúng phải là A, B, C hoặc D');
        }
        questionData.explanation = explanation?.trim() || '';
        questionData.paragraph = paragraph.trim();
        break;

      case 2:
        if (!questionText || !questionText.trim()) return res.status(400).send('Câu hỏi là bắt buộc cho Part 2');
        if (!optionA || !optionB || !optionC) {
          return res.status(400).send('Part 2 phải có đúng 3 lựa chọn');
        }
        questionData.options = [optionA.trim(), optionB.trim(), optionC.trim()];
        questionData.questionText = questionText.trim();
        questionData.correctAnswer = correctAnswer?.toUpperCase();
        if (!['A', 'B', 'C'].includes(questionData.correctAnswer)) {
          return res.status(400).send('Đáp án đúng phải là A, B hoặc C');
        }
        questionData.explanation = explanation?.trim() || '';
        break;

      case 3:
        const questionsPart3 = [];
        for (let i = 1; i <= 3; i++) {
          const text = req.body[`question${i}Text`];
          const optionA = req.body[`question${i}OptionA`];
          const optionB = req.body[`question${i}OptionB`];
          const optionC = req.body[`question${i}OptionC`];
          const optionD = req.body[`question${i}OptionD`];
          const correctAnswer = req.body[`question${i}CorrectAnswer`];
          const explanation = req.body[`question${i}Explanation`];

          console.log(`Part 3 - Câu hỏi ${i}:`, { text, optionA, optionB, optionC, optionD, correctAnswer });

          if (!text || !text.trim()) throw new Error(`Câu hỏi ${i} trong Part 3 phải có nội dung`);
          if (!optionA || !optionB || !optionC || !optionD) {
            throw new Error(`Câu hỏi ${i} trong Part 3 phải có đúng 4 lựa chọn`);
          }
          if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            throw new Error(`Đáp án đúng của câu hỏi ${i} trong Part 3 phải là A, B, C hoặc D`);
          }

          questionsPart3.push({
            text: text.trim(),
            options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
            correctAnswer: correctAnswer.toUpperCase(),
            explanation: explanation?.trim() || ''
          });
        }
        questionData.questions = questionsPart3;
        questionData.transcript = transcript?.trim() || '';
        if (req.files?.diagram) {
          questionData.diagramUrl = '/images/listening/' + req.files.diagram[0].filename;
        }
        break;

      case 4:
        const questionsPart4 = [];
        for (let i = 1; i <= 3; i++) {
          const text = req.body[`question${i}Text`];
          const optionA = req.body[`question${i}OptionA`];
          const optionB = req.body[`question${i}OptionB`];
          const optionC = req.body[`question${i}OptionC`];
          const optionD = req.body[`question${i}OptionD`];
          const correctAnswer = req.body[`question${i}CorrectAnswer`];
          const explanation = req.body[`question${i}Explanation`];

          console.log(`Part 4 - Câu hỏi ${i}:`, { text, optionA, optionB, optionC, optionD, correctAnswer });

          if (!text || !text.trim()) throw new Error(`Câu hỏi ${i} trong Part 4 phải có nội dung`);
          if (!optionA || !optionB || !optionC || !optionD) {
            throw new Error(`Câu hỏi ${i} trong Part 4 phải có đúng 4 lựa chọn`);
          }
          if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            throw new Error(`Đáp án đúng của câu hỏi ${i} trong Part 4 phải là A, B, C hoặc D`);
          }

          questionsPart4.push({
            text: text.trim(),
            options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
            correctAnswer: correctAnswer.toUpperCase(),
            explanation: explanation?.trim() || ''
          });
        }
        questionData.questions = questionsPart4;
        questionData.transcript = transcript?.trim() || '';
        if (req.files?.diagram) {
          questionData.diagramUrl = '/images/listening/' + req.files.diagram[0].filename;
        }
        break;

      default:
        return res.status(400).send('Phần không hợp lệ');
    }

    const listeningQuestion = new Model(questionData);
    await listeningQuestion.save();

    res.redirect('/admin/listeningTOEIC');
  } catch (error) {
    console.error('Server error:', error.message);
    ['audio', 'image', 'diagram'].forEach(field => {
      if (req.files?.[field]) {
        deleteFile('/' + (field === 'audio' ? 'audio' : 'images') + '/listening/' + req.files[field][0].filename);
      }
    });
    res.status(500).send('Lỗi server nội bộ: ' + error.message);
  }
};

// Hiển thị form chỉnh sửa
exports.showEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID không hợp lệ');
    }

    let question;
    for (const Model of [ListeningTOEICPart1, ListeningTOEICPart2, ListeningTOEICPart3, ListeningTOEICPart4]) {
      question = await Model.findById(id).lean();
      if (question) break;
    }

    if (!question) return res.status(404).send('Không tìm thấy câu hỏi');

    if (question.part === 2) {
      question.formattedOptions = JSON.stringify(question.options, null, 2);
    } else if (question.part === 3 || question.part === 4) {
      question.formattedQuestions = JSON.stringify(question.questions, null, 2);
    }

    res.render('admin/pages/TOEIC/edit-listening-question', { question });
  } catch (err) {
    res.status(500).send('Lỗi khi tải câu hỏi: ' + err.message);
  }
};

// Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      part, 
      questionNumber, 
      correctAnswer, 
      explanation, 
      questionText, 
      transcript, 
      removeAudio, 
      removeImage, 
      removeDiagram,
      optionA, optionB, optionC, optionD,
      question1Text, question1OptionA, question1OptionB, question1OptionC, question1OptionD, question1CorrectAnswer, question1Explanation,
      question2Text, question2OptionA, question2OptionB, question2OptionC, question2OptionD, question2CorrectAnswer, question2Explanation,
      question3Text, question3OptionA, question3OptionB, question3OptionC, question3OptionD, question3CorrectAnswer, question3Explanation
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID không hợp lệ');
    }

    const Model = getModelByPart(part);
    const existingQuestion = await Model.findById(id);
    if (!existingQuestion) return res.status(404).send('Không tìm thấy câu hỏi');

    // Cập nhật các trường chung
    existingQuestion.questionNumber = parseInt(questionNumber) || existingQuestion.questionNumber;
    if (existingQuestion.questionNumber < 1 || existingQuestion.questionNumber > 100) {
      return res.status(400).send('Số câu hỏi phải từ 1 đến 100');
    }

    // Kiểm tra xem questionNumber có bị trùng không (trừ câu hỏi hiện tại)
    const duplicateQuestion = await Model.findOne({
      part: existingQuestion.part,
      questionNumber: existingQuestion.questionNumber,
      _id: { $ne: id },
    });
    if (duplicateQuestion) {
      return res.status(400).send(`Số câu hỏi ${existingQuestion.questionNumber} đã tồn tại trong Part ${existingQuestion.part}`);
    }

    existingQuestion.explanation = explanation?.trim() || '';

    // Xử lý audio
    if (removeAudio === 'on') {
      deleteFile(existingQuestion.audioUrl);
      existingQuestion.audioUrl = undefined;
    } else if (req.files?.audio) {
      deleteFile(existingQuestion.audioUrl);
      existingQuestion.audioUrl = '/audio/listening/' + req.files.audio[0].filename;
    }
    if (!existingQuestion.audioUrl) {
      return res.status(400).send('File audio là bắt buộc');
    }

    switch (existingQuestion.part) {
      case 1:
        if (removeImage === 'on') {
          deleteFile(existingQuestion.imageUrl);
          existingQuestion.imageUrl = undefined;
        } else if (req.files?.image) {
          deleteFile(existingQuestion.imageUrl);
          existingQuestion.imageUrl = '/images/listening/' + req.files.image[0].filename;
        }
        if (!existingQuestion.imageUrl) return res.status(400).send('Hình ảnh là bắt buộc cho Part 1');
        if (!optionA || !optionB || !optionC || !optionD) {
          return res.status(400).send('Part 1 phải có đúng 4 lựa chọn');
        }
        existingQuestion.options = [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()];
        existingQuestion.correctAnswer = correctAnswer?.toUpperCase();
        if (!['A', 'B', 'C', 'D'].includes(existingQuestion.correctAnswer)) {
          return res.status(400).send('Đáp án đúng phải là A, B, C hoặc D');
        }
        existingQuestion.paragraph = req.body.paragraph?.trim() || '';
        break;

      case 2:
        existingQuestion.questionText = questionText?.trim() || '';
        if (!existingQuestion.questionText) return res.status(400).send('Câu hỏi là bắt buộc cho Part 2');
        if (!optionA || !optionB || !optionC) {
          return res.status(400).send('Part 2 phải có đúng 3 lựa chọn');
        }
        existingQuestion.options = [optionA.trim(), optionB.trim(), optionC.trim()];
        existingQuestion.correctAnswer = correctAnswer?.toUpperCase();
        if (!['A', 'B', 'C'].integcludes(existingQuestion.correctAnswer)) {
          return res.status(400).send('Đáp án đúng phải là A, B hoặc C');
        }
        break;

      case 3:
        const questionsPart3 = [];
        for (let i = 1; i <= 3; i++) {
          const text = req.body[`question${i}Text`];
          const optionA = req.body[`question${i}OptionA`];
          const optionB = req.body[`question${i}OptionB`];
          const optionC = req.body[`question${i}OptionC`];
          const optionD = req.body[`question${i}OptionD`];
          const correctAnswer = req.body[`question${i}CorrectAnswer`];
          const explanation = req.body[`question${i}Explanation`];

          console.log(`Part 3 Update - Câu hỏi ${i}:`, { text, optionA, optionB, optionC, optionD, correctAnswer });

          if (!text || !text.trim()) throw new Error(`Câu hỏi ${i} trong Part 3 phải có nội dung`);
          if (!optionA || !optionB || !optionC || !optionD) {
            throw new Error(`Câu hỏi ${i} trong Part 3 phải có đúng 4 lựa chọn`);
          }
          if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            throw new Error(`Đáp án đúng của câu hỏi ${i} trong Part 3 phải là A, B, C hoặc D`);
          }

          questionsPart3.push({
            text: text.trim(),
            options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
            correctAnswer: correctAnswer.toUpperCase(),
            explanation: explanation?.trim() || ''
          });
        }
        existingQuestion.questions = questionsPart3;
        existingQuestion.transcript = transcript?.trim() || '';
        if (removeDiagram === 'on') {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = undefined;
        } else if (req.files?.diagram) {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = '/images/listening/' + req.files.diagram[0].filename;
        }
        break;

      case 4:
        const questionsPart4 = [];
        for (let i = 1; i <= 3; i++) {
          const text = req.body[`question${i}Text`];
          const optionA = req.body[`question${i}OptionA`];
          const optionB = req.body[`question${i}OptionB`];
          const optionC = req.body[`question${i}OptionC`];
          const optionD = req.body[`question${i}OptionD`];
          const correctAnswer = req.body[`question${i}CorrectAnswer`];
          const explanation = req.body[`question${i}Explanation`];

          console.log(`Part 4 Update - Câu hỏi ${i}:`, { text, optionA, optionB, optionC, optionD, correctAnswer });

          if (!text || !text.trim()) throw new Error(`Câu hỏi ${i} trong Part 4 phải có nội dung`);
          if (!optionA || !optionB || !optionC || !optionD) {
            throw new Error(`Câu hỏi ${i} trong Part 4 phải có đúng 4 lựa chọn`);
          }
          if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
            throw new Error(`Đáp án đúng của câu hỏi ${i} trong Part 4 phải là A, B, C hoặc D`);
          }

          questionsPart4.push({
            text: text.trim(),
            options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
            correctAnswer: correctAnswer.toUpperCase(),
            explanation: explanation?.trim() || ''
          });
        }
        existingQuestion.questions = questionsPart4;
        existingQuestion.transcript = transcript?.trim() || '';
        if (removeDiagram === 'on') {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = undefined;
        } else if (req.files?.diagram) {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = '/images/listening/' + req.files.diagram[0].filename;
        }
        break;

      default:
        return res.status(400).send('Phần không hợp lệ');
    }

    await existingQuestion.save();
    res.redirect('/admin/listeningTOEIC');
  } catch (err) {
    console.error('Server error:', err.message);
    ['audio', 'image', 'diagram'].forEach(field => {
      if (req.files?.[field]) {
        deleteFile('/' + (field === 'audio' ? 'audio' : 'images') + '/listening/' + req.files[field][0].filename);
      }
    });
    res.status(500).send('Lỗi khi cập nhật câu hỏi: ' + err.message);
  }
};

// Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send('ID không hợp lệ');
    }

    let question;
    for (const Model of [ListeningTOEICPart1, ListeningTOEICPart2, ListeningTOEICPart3, ListeningTOEICPart4]) {
      question = await Model.findById(id);
      if (question) {
        await Model.findByIdAndDelete(id);
        deleteFile(question.audioUrl);
        deleteFile(question.imageUrl);
        deleteFile(question.diagramUrl);
        break;
      }
    }

    if (!question) return res.status(404).send('Không tìm thấy câu hỏi');

    res.redirect('/admin/listeningTOEIC');
  } catch (err) {
    res.status(500).send('Lỗi khi xóa câu hỏi: ' + err.message);
  }
};

// Lấy câu hỏi theo phần
exports.getQuestionsByPart = async (req, res) => {
  try {
    const { part } = req.params;
    const Model = getModelByPart(part);
    const questions = await Model.find().lean();
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy câu hỏi: ' + err.message });
  }
};