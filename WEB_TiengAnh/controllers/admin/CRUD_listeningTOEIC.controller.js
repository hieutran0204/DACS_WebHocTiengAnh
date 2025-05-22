const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { ListeningTOEICPart1, ListeningTOEICPart2, ListeningTOEICPart3, ListeningTOEICPart4 } = require('../../models/TOEIC/listeningTOEIC.model');

// Hàm hỗ trợ xóa file
const deleteFile = (filePath) => {
  if (!filePath) return;
  const fullPath = path.join(__dirname, '../../public', filePath.replace(/^\/shared/, '')); // Loại bỏ /shared để khớp với cấu trúc thư mục
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`Đã xóa file: ${fullPath}`);
  } else {
    console.warn(`File không tồn tại để xóa: ${fullPath}`);
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
    console.error('Lỗi khi lấy câu hỏi:', err);
    res.status(500).json({ error: 'Lỗi khi lấy câu hỏi: ' + err.message });
  }
};

// Hiển thị form tạo mới
exports.showCreateForm = (req, res) => {
  res.render('admin/pages/TOEIC/create-listening-question');
};

// Tạo câu hỏi Part 1
exports.createListeningQuestionPart1 = async (req, res) => {
  try {
    const { questionNumber, paragraph, optionA, optionB, optionC, optionD, correctAnswer, explanation } = req.body;
    const files = req.files;

    console.log('Part 1 Form data:', JSON.stringify(req.body, null, 2));
    console.log('Part 1 Files:', JSON.stringify(files, null, 2));

    if (req.fileValidationError) {
      return res.status(400).json({ error: `Lỗi upload file: ${req.fileValidationError}` });
    }

    if (!questionNumber || isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
      return res.status(400).json({ error: 'Số câu hỏi phải từ 1 đến 100' });
    }
    if (!files || !files.audio || !files.audio[0]?.filename) {
      return res.status(400).json({ error: 'File audio là bắt buộc (MP3/WAV)' });
    }
    if (!files.image || !files.image[0]?.filename) {
      return res.status(400).json({ error: 'File hình ảnh là bắt buộc (JPEG/PNG/GIF/WEBP)' });
    }
    if (!paragraph?.trim()) {
      return res.status(400).json({ error: 'Câu hỏi mô tả hình ảnh là bắt buộc' });
    }
    if (!optionA?.trim() || !optionB?.trim() || !optionC?.trim() || !optionD?.trim()) {
      return res.status(400).json({ error: 'Phải cung cấp đúng 4 đáp án' });
    }
    if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(correctAnswer)) {
      return res.status(400).json({ error: 'Đáp án đúng phải là A, B, C hoặc D' });
    }

    const questionData = {
      part: 1,
      questionNumber: parseInt(questionNumber),
      audioUrl: `/shared/audio/listening_TOEIC/${files.audio[0].filename}`,
      imageUrl: `/shared/images/listening_TOEIC/${files.image[0].filename}`,
      paragraph: paragraph.trim(),
      options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
      correctAnswer: correctAnswer.toUpperCase(),
      explanation: explanation?.trim() || ''
    };

    const uploadedFiles = [questionData.audioUrl, questionData.imageUrl];

    const duplicateQuestion = await ListeningTOEICPart1.findOne({
      part: 1,
      questionNumber: questionData.questionNumber
    });
    if (duplicateQuestion) {
      uploadedFiles.forEach(deleteFile);
      return res.status(400).json({ error: `Số câu hỏi ${questionNumber} đã tồn tại trong Part 1` });
    }

    const newQuestion = new ListeningTOEICPart1(questionData);
    await newQuestion.save();
    console.log(`Đã lưu câu hỏi Part 1: Question ${questionNumber}`);
    res.status(201).json({ message: 'Tạo câu hỏi Part 1 thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi Part 1:', error);
    ['audio', 'image'].forEach(field => {
      if (req.files?.[field]?.[0]?.filename) {
        const folder = field === 'audio' ? 'audio' : 'images';
        deleteFile(`/shared/${folder}/listening_TOEIC/${req.files[field][0].filename}`);
      }
    });
    res.status(500).json({ error: `Lỗi server: ${error.message}` });
  }
};

// Tạo câu hỏi Part 2
exports.createListeningQuestionPart2 = async (req, res) => {
  try {
    const { questionNumber, questionText, optionA, optionB, optionC, correctAnswer, explanation } = req.body;
    const files = req.files;

    console.log('Part 2 Form data:', JSON.stringify(req.body, null, 2));
    console.log('Part 2 Files:', JSON.stringify(files, null, 2));

    if (req.fileValidationError) {
      return res.status(400).json({ error: `Lỗi upload file: ${req.fileValidationError}` });
    }

    if (!questionNumber || isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
      return res.status(400).json({ error: 'Số câu hỏi phải từ 1 đến 100' });
    }
    if (!files || !files.audio || !files.audio[0]?.filename) {
      return res.status(400).json({ error: 'File audio là bắt buộc (MP3/WAV)' });
    }
    if (!questionText?.trim()) {
      return res.status(400).json({ error: 'Câu hỏi là bắt buộc' });
    }
    if (!optionA?.trim() || !optionB?.trim() || !optionC?.trim()) {
      return res.status(400).json({ error: 'Phải cung cấp đúng 3 đáp án (A, B, C)' });
    }
    if (!correctAnswer || !['A', 'B', 'C'].includes(correctAnswer)) {
      return res.status(400).json({ error: 'Đáp án đúng phải là A, B hoặc C' });
    }

    const questionData = {
      part: 2,
      questionNumber: parseInt(questionNumber),
      audioUrl: `/shared/audio/listening_TOEIC/${files.audio[0].filename}`,
      questionText: questionText.trim(),
      options: [optionA.trim(), optionB.trim(), optionC.trim()],
      correctAnswer: correctAnswer.toUpperCase(),
      explanation: explanation?.trim() || ''
    };

    const uploadedFiles = [questionData.audioUrl];

    const duplicateQuestion = await ListeningTOEICPart2.findOne({
      part: 2,
      questionNumber: questionData.questionNumber
    });
    if (duplicateQuestion) {
      uploadedFiles.forEach(deleteFile);
      return res.status(400).json({ error: `Số câu hỏi ${questionNumber} đã tồn tại trong Part 2` });
    }

    const newQuestion = new ListeningTOEICPart2(questionData);
    await newQuestion.save();
    console.log(`Đã lưu câu hỏi Part 2: Question ${questionNumber}`);
    res.status(201).json({ message: 'Tạo câu hỏi Part 2 thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi Part 2:', error);
    if (req.files?.audio?.[0]?.filename) {
      deleteFile(`/shared/audio/listening_TOEIC/${req.files.audio[0].filename}`);
    }
    res.status(500).json({ error: `Lỗi server: ${error.message}` });
  }
};

// Tạo câu hỏi Part 3
exports.createListeningQuestionPart3 = async (req, res) => {
  try {
    const { questionNumber, transcript, question1Text, question1OptionA, question1OptionB, question1OptionC, question1OptionD, question1CorrectAnswer, question1Explanation,
            question2Text, question2OptionA, question2OptionB, question2OptionC, question2OptionD, question2CorrectAnswer, question2Explanation,
            question3Text, question3OptionA, question3OptionB, question3OptionC, question3OptionD, question3CorrectAnswer, question3Explanation } = req.body;
    const files = req.files;

    console.log('Part 3 Form data:', JSON.stringify(req.body, null, 2));
    console.log('Part 3 Files:', JSON.stringify(files, null, 2));

    if (req.fileValidationError) {
      return res.status(400).json({ error: `Lỗi upload file: ${req.fileValidationError}` });
    }

    if (!questionNumber || isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
      return res.status(400).json({ error: 'Số câu hỏi phải từ 1 đến 100' });
    }
    if (!files || !files.audio || !files.audio[0]?.filename) {
      return res.status(400).json({ error: 'File audio là bắt buộc (MP3/WAV)' });
    }

    const questions = [
      {
        text: question1Text?.trim() || '',
        options: [question1OptionA?.trim() || '', question1OptionB?.trim() || '', question1OptionC?.trim() || '', question1OptionD?.trim() || ''],
        correctAnswer: question1CorrectAnswer?.toUpperCase() || '',
        explanation: question1Explanation?.trim() || ''
      },
      {
        text: question2Text?.trim() || '',
        options: [question2OptionA?.trim() || '', question2OptionB?.trim() || '', question2OptionC?.trim() || '', question2OptionD?.trim() || ''],
        correctAnswer: question2CorrectAnswer?.toUpperCase() || '',
        explanation: question2Explanation?.trim() || ''
      },
      {
        text: question3Text?.trim() || '',
        options: [question3OptionA?.trim() || '', question3OptionB?.trim() || '', question3OptionC?.trim() || '', question3OptionD?.trim() || ''],
        correctAnswer: question3CorrectAnswer?.toUpperCase() || '',
        explanation: question3Explanation?.trim() || ''
      }
    ];

    for (let i = 0; i < 3; i++) {
      if (!questions[i].text.trim()) {
        return res.status(400).json({ error: `Nội dung câu hỏi ${i + 1} là bắt buộc` });
      }
      if (!questions[i].options.every(opt => opt.trim())) {
        return res.status(400).json({ error: `Câu hỏi ${i + 1} phải có đúng 4 đáp án` });
      }
      if (!questions[i].correctAnswer || !['A', 'B', 'C', 'D'].includes(questions[i].correctAnswer)) {
        return res.status(400).json({ error: `Đáp án đúng của câu hỏi ${i + 1} phải là A, B, C hoặc D` });
      }
    }

    const questionData = {
      part: 3,
      questionNumber: parseInt(questionNumber),
      audioUrl: `/shared/audio/listening_TOEIC/${files.audio[0].filename}`,
      transcript: transcript?.trim() || '',
      diagramUrl: files.diagram && files.diagram[0]?.filename ? `/shared/diagrams/listening_TOEIC/${files.diagram[0].filename}` : '',
      questions
    };

    const uploadedFiles = [questionData.audioUrl];
    if (questionData.diagramUrl) uploadedFiles.push(questionData.diagramUrl);

    const duplicateQuestion = await ListeningTOEICPart3.findOne({
      part: 3,
      questionNumber: questionData.questionNumber
    });
    if (duplicateQuestion) {
      uploadedFiles.forEach(deleteFile);
      return res.status(400).json({ error: `Số câu hỏi ${questionNumber} đã tồn tại trong Part 3` });
    }

    const newQuestion = new ListeningTOEICPart3(questionData);
    await newQuestion.save();
    console.log(`Đã lưu câu hỏi Part 3: Question ${questionNumber}`);
    res.status(201).json({ message: 'Tạo câu hỏi Part 3 thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi Part 3:', error);
    ['audio', 'diagram'].forEach(field => {
      if (req.files?.[field]?.[0]?.filename) {
        const folder = field === 'audio' ? 'audio' : 'diagrams';
        deleteFile(`/shared/${folder}/listening_TOEIC/${req.files[field][0].filename}`);
      }
    });
    res.status(500).json({ error: `Lỗi server: ${error.message}` });
  }
};

// Tạo câu hỏi Part 4
exports.createListeningQuestionPart4 = async (req, res) => {
  try {
    const { questionNumber, transcript, question1Text, question1OptionA, question1OptionB, question1OptionC, question1OptionD, question1CorrectAnswer, question1Explanation,
            question2Text, question2OptionA, question2OptionB, question2OptionC, question2OptionD, question2CorrectAnswer, question2Explanation,
            question3Text, question3OptionA, question3OptionB, question3OptionC, question3OptionD, question3CorrectAnswer, question3Explanation } = req.body;
    const files = req.files;

    console.log('Part 4 Form data:', JSON.stringify(req.body, null, 2));
    console.log('Part 4 Files:', JSON.stringify(files, null, 2));

    if (req.fileValidationError) {
      return res.status(400).json({ error: `Lỗi upload file: ${req.fileValidationError}` });
    }

    if (!questionNumber || isNaN(questionNumber) || questionNumber < 1 || questionNumber > 100) {
      return res.status(400).json({ error: 'Số câu hỏi phải từ 1 đến 100' });
    }
    if (!files || !files.audio || !files.audio[0]?.filename) {
      return res.status(400).json({ error: 'File audio là bắt buộc (MP3/WAV)' });
    }

    const questions = [
      {
        text: question1Text?.trim() || '',
        options: [question1OptionA?.trim() || '', question1OptionB?.trim() || '', question1OptionC?.trim() || '', question1OptionD?.trim() || ''],
        correctAnswer: question1CorrectAnswer?.toUpperCase() || '',
        explanation: question1Explanation?.trim() || ''
      },
      {
        text: question2Text?.trim() || '',
        options: [question2OptionA?.trim() || '', question2OptionB?.trim() || '', question2OptionC?.trim() || '', question2OptionD?.trim() || ''],
        correctAnswer: question2CorrectAnswer?.toUpperCase() || '',
        explanation: question2Explanation?.trim() || ''
      },
      {
        text: question3Text?.trim() || '',
        options: [question3OptionA?.trim() || '', question3OptionB?.trim() || '', question3OptionC?.trim() || '', question3OptionD?.trim() || ''],
        correctAnswer: question3CorrectAnswer?.toUpperCase() || '',
        explanation: question3Explanation?.trim() || ''
      }
    ];

    for (let i = 0; i < 3; i++) {
      if (!questions[i].text.trim()) {
        return res.status(400).json({ error: `Nội dung câu hỏi ${i + 1} là bắt buộc` });
      }
      if (!questions[i].options.every(opt => opt.trim())) {
        return res.status(400).json({ error: `Câu hỏi ${i + 1} phải có đúng 4 đáp án` });
      }
      if (!questions[i].correctAnswer || !['A', 'B', 'C', 'D'].includes(questions[i].correctAnswer)) {
        return res.status(400).json({ error: `Đáp án đúng của câu hỏi ${i + 1} phải là A, B, C hoặc D` });
      }
    }

    const questionData = {
      part: 4,
      questionNumber: parseInt(questionNumber),
      audioUrl: `/shared/audio/listening_TOEIC/${files.audio[0].filename}`,
      transcript: transcript?.trim() || '',
      diagramUrl: files.diagram && files.diagram[0]?.filename ? `/shared/diagrams/listening_TOEIC/${files.diagram[0].filename}` : '',
      questions
    };

    const uploadedFiles = [questionData.audioUrl];
    if (questionData.diagramUrl) uploadedFiles.push(questionData.diagramUrl);

    const duplicateQuestion = await ListeningTOEICPart4.findOne({
      part: 4,
      questionNumber: questionData.questionNumber
    });
    if (duplicateQuestion) {
      uploadedFiles.forEach(deleteFile);
      return res.status(400).json({ error: `Số câu hỏi ${questionNumber} đã tồn tại trong Part 4` });
    }

    const newQuestion = new ListeningTOEICPart4(questionData);
    await newQuestion.save();
    console.log(`Đã lưu câu hỏi Part 4: Question ${questionNumber}`);
    res.status(201).json({ message: 'Tạo câu hỏi Part 4 thành công' });
  } catch (error) {
    console.error('Lỗi khi tạo câu hỏi Part 4:', error);
    ['audio', 'diagram'].forEach(field => {
      if (req.files?.[field]?.[0]?.filename) {
        const folder = field === 'audio' ? 'audio' : 'diagrams';
        deleteFile(`/shared/${folder}/listening_TOEIC/${req.files[field][0].filename}`);
      }
    });
    res.status(500).json({ error: `Lỗi server: ${error.message}` });
  }
};

// Điều hướng tạo câu hỏi dựa trên Part
exports.createListeningQuestion = async (req, res) => {
  const { part } = req.body;
  try {
    if (part === '1') {
      return await exports.createListeningQuestionPart1(req, res);
    } else if (part === '2') {
      return await exports.createListeningQuestionPart2(req, res);
    } else if (part === '3') {
      return await exports.createListeningQuestionPart3(req, res);
    } else if (part === '4') {
      return await exports.createListeningQuestionPart4(req, res);
    } else {
      return res.status(400).json({ error: 'Part không hợp lệ' });
    }
  } catch (error) {
    console.error('Lỗi khi điều hướng tạo câu hỏi:', error);
    res.status(500).json({ error: `Lỗi server: ${error.message}` });
  }
};

// Hiển thị form chỉnh sửa
exports.showEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    let question;
    for (const Model of [ListeningTOEICPart1, ListeningTOEICPart2, ListeningTOEICPart3, ListeningTOEICPart4]) {
      question = await Model.findById(id).lean();
      if (question) break;
    }

    if (!question) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });

    if (question.part === 2) {
      question.formattedOptions = JSON.stringify(question.options, null, 2);
    } else if (question.part === 3 || question.part === 4) {
      question.formattedQuestions = JSON.stringify(question.questions, null, 2);
    }

    res.render('admin/pages/TOEIC/edit-listening-question', { question });
  } catch (err) {
    console.error('Lỗi khi tải câu hỏi:', err);
    res.status(500).json({ error: 'Lỗi khi tải câu hỏi: ' + err.message });
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
    const files = req.files;

    console.log('Form data:', JSON.stringify(req.body, null, 2));
    console.log('Files:', JSON.stringify(files, null, 2));

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    const Model = getModelByPart(part);
    const existingQuestion = await Model.findById(id);
    if (!existingQuestion) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });

    const newQuestionNumber = parseInt(questionNumber) || existingQuestion.questionNumber;
    if (newQuestionNumber < 1 || newQuestionNumber > 100) {
      return res.status(400).json({ error: 'Số câu hỏi phải từ 1 đến 100' });
    }

    const duplicateQuestion = await Model.findOne({
      part: existingQuestion.part,
      questionNumber: newQuestionNumber,
      _id: { $ne: id },
    });
    if (duplicateQuestion) {
      return res.status(400).json({ error: `Số câu hỏi ${newQuestionNumber} đã tồn tại trong Part ${existingQuestion.part}` });
    }

    existingQuestion.questionNumber = newQuestionNumber;
    existingQuestion.explanation = explanation?.trim() || '';

    if (removeAudio === 'on') {
      deleteFile(existingQuestion.audioUrl);
      existingQuestion.audioUrl = undefined;
    } else if (files?.audio?.[0]?.filename) {
      deleteFile(existingQuestion.audioUrl);
      existingQuestion.audioUrl = `/shared/audio/listening_TOEIC/${files.audio[0].filename}`;
    }
    if (!existingQuestion.audioUrl) {
      return res.status(400).json({ error: 'File audio là bắt buộc' });
    }

    switch (existingQuestion.part) {
      case 1:
        if (removeImage === 'on') {
          deleteFile(existingQuestion.imageUrl);
          existingQuestion.imageUrl = undefined;
        } else if (files?.image?.[0]?.filename) {
          deleteFile(existingQuestion.imageUrl);
          existingQuestion.imageUrl = `/shared/images/listening_TOEIC/${files.image[0].filename}`;
        }
        if (!existingQuestion.imageUrl) {
          return res.status(400).json({ error: 'Hình ảnh là bắt buộc cho Part 1' });
        }
        if (!optionA?.trim() || !optionB?.trim() || !optionC?.trim() || !optionD?.trim()) {
          return res.status(400).json({ error: 'Part 1 phải có đúng 4 lựa chọn' });
        }
        existingQuestion.options = [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()];
        existingQuestion.correctAnswer = correctAnswer?.toUpperCase();
        if (!correctAnswer || !['A', 'B', 'C', 'D'].includes(existingQuestion.correctAnswer)) {
          return res.status(400).json({ error: 'Đáp án đúng phải là A, B, C hoặc D' });
        }
        existingQuestion.paragraph = req.body.paragraph?.trim() || '';
        break;

      case 2:
        existingQuestion.questionText = questionText?.trim() || '';
        if (!existingQuestion.questionText) {
          return res.status(400).json({ error: 'Câu hỏi là bắt buộc cho Part 2' });
        }
        if (!optionA?.trim() || !optionB?.trim() || !optionC?.trim()) {
          return res.status(400).json({ error: 'Part 2 phải có đúng 3 lựa chọn' });
        }
        existingQuestion.options = [optionA.trim(), optionB.trim(), optionC.trim()];
        existingQuestion.correctAnswer = correctAnswer?.toUpperCase();
        if (!correctAnswer || !['A', 'B', 'C'].includes(existingQuestion.correctAnswer)) {
          return res.status(400).json({ error: 'Đáp án đúng phải là A, B hoặc C' });
        }
        break;

      case 3:
        const questionsPart3 = [
          {
            text: question1Text?.trim() || '',
            options: [question1OptionA?.trim() || '', question1OptionB?.trim() || '', question1OptionC?.trim() || '', question1OptionD?.trim() || ''],
            correctAnswer: question1CorrectAnswer?.toUpperCase() || '',
            explanation: question1Explanation?.trim() || ''
          },
          {
            text: question2Text?.trim() || '',
            options: [question2OptionA?.trim() || '', question2OptionB?.trim() || '', question2OptionC?.trim() || '', question2OptionD?.trim() || ''],
            correctAnswer: question2CorrectAnswer?.toUpperCase() || '',
            explanation: question2Explanation?.trim() || ''
          },
          {
            text: question3Text?.trim() || '',
            options: [question3OptionA?.trim() || '', question3OptionB?.trim() || '', question3OptionC?.trim() || '', question3OptionD?.trim() || ''],
            correctAnswer: question3CorrectAnswer?.toUpperCase() || '',
            explanation: question3Explanation?.trim() || ''
          }
        ];

        for (let i = 0; i < 3; i++) {
          if (!questionsPart3[i].text.trim()) {
            return res.status(400).json({ error: `Câu hỏi ${i + 1} trong Part 3 phải có nội dung` });
          }
          if (!questionsPart3[i].options.every(opt => opt.trim())) {
            return res.status(400).json({ error: `Câu hỏi ${i + 1} trong Part 3 phải có đúng 4 lựa chọn` });
          }
          if (!questionsPart3[i].correctAnswer || !['A', 'B', 'C', 'D'].includes(questionsPart3[i].correctAnswer)) {
            return res.status(400).json({ error: `Đáp án đúng của câu hỏi ${i + 1} trong Part 3 phải là A, B, C hoặc D` });
          }
        }

        existingQuestion.questions = questionsPart3;
        existingQuestion.transcript = transcript?.trim() || '';
        if (removeDiagram === 'on') {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = undefined;
        } else if (files?.diagram?.[0]?.filename) {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = `/shared/diagrams/listening_TOEIC/${files.diagram[0].filename}`;
        }
        break;

      case 4:
        const questionsPart4 = [
          {
            text: question1Text?.trim() || '',
            options: [question1OptionA?.trim() || '', question1OptionB?.trim() || '', question1OptionC?.trim() || '', question1OptionD?.trim() || ''],
            correctAnswer: question1CorrectAnswer?.toUpperCase() || '',
            explanation: question1Explanation?.trim() || ''
          },
          {
            text: question2Text?.trim() || '',
            options: [question2OptionA?.trim() || '', question2OptionB?.trim() || '', question2OptionC?.trim() || '', question2OptionD?.trim() || ''],
            correctAnswer: question2CorrectAnswer?.toUpperCase() || '',
            explanation: question2Explanation?.trim() || ''
          },
          {
            text: question3Text?.trim() || '',
            options: [question3OptionA?.trim() || '', question3OptionB?.trim() || '', question3OptionC?.trim() || '', question3OptionD?.trim() || ''],
            correctAnswer: question3CorrectAnswer?.toUpperCase() || '',
            explanation: question3Explanation?.trim() || ''
          }
        ];

        for (let i = 0; i < 3; i++) {
          if (!questionsPart4[i].text.trim()) {
            return res.status(400).json({ error: `Câu hỏi ${i + 1} trong Part 4 phải có nội dung` });
          }
          if (!questionsPart4[i].options.every(opt => opt.trim())) {
            return res.status(400).json({ error: `Câu hỏi ${i + 1} trong Part 4 phải có đúng 4 lựa chọn` });
          }
          if (!questionsPart4[i].correctAnswer || !['A', 'B', 'C', 'D'].includes(questionsPart4[i].correctAnswer)) {
            return res.status(400).json({ error: `Đáp án đúng của câu hỏi ${i + 1} trong Part 4 phải là A, B, C hoặc D` });
          }
        }

        existingQuestion.questions = questionsPart4;
        existingQuestion.transcript = transcript?.trim() || '';
        if (removeDiagram === 'on') {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = undefined;
        } else if (files?.diagram?.[0]?.filename) {
          deleteFile(existingQuestion.diagramUrl);
          existingQuestion.diagramUrl = `/shared/diagrams/listening_TOEIC/${files.diagram[0].filename}`;
        }
        break;

      default:
        return res.status(400).json({ error: 'Phần không hợp lệ' });
    }

    await existingQuestion.save();
    console.log(`Đã cập nhật câu hỏi: ID ${id}, Part ${part}`);
    res.status(200).json({ message: 'Cập nhật câu hỏi thành công' });
  } catch (error) {
    console.error('Lỗi khi cập nhật câu hỏi:', error);
    ['audio', 'image', 'diagram'].forEach(field => {
      if (req.files?.[field]?.[0]?.filename) {
        const folder = field === 'audio' ? 'audio' : field === 'image' ? 'images' : 'diagrams';
        deleteFile(`/shared/${folder}/listening_TOEIC/${req.files[field][0].filename}`);
      }
    });
    res.status(500).json({ error: `Lỗi server: ${error.message}` });
  }
};

// Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'ID không hợp lệ' });
    }

    let question;
    let Model;
    for (const M of [ListeningTOEICPart1, ListeningTOEICPart2, ListeningTOEICPart3, ListeningTOEICPart4]) {
      question = await M.findById(id);
      if (question) {
        Model = M;
        break;
      }
    }

    if (!question) return res.status(404).json({ error: 'Không tìm thấy câu hỏi' });

    deleteFile(question.audioUrl);
    if (question.imageUrl) deleteFile(question.imageUrl);
    if (question.diagramUrl) deleteFile(question.diagramUrl);

    await Model.deleteOne({ _id: id });
    console.log(`Đã xóa câu hỏi: ID ${id}`);
    res.status(200).json({ message: 'Xóa câu hỏi thành công' });
  } catch (err) {
    console.error('Lỗi khi xóa câu hỏi:', err);
    res.status(500).json({ error: 'Lỗi khi xóa câu hỏi: ' + err.message });
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
    console.error('Lỗi khi lấy câu hỏi:', err);
    res.status(500).json({ error: 'Lỗi khi lấy câu hỏi: ' + err.message });
  }
};