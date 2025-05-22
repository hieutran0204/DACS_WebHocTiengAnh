// // CRUD_writingTOEIC.controller.js
// const mongoose = require("mongoose");
// const fs = require("fs");
// const path = require("path");
// const WritingQuestion = require("../../models/TOEIC/writingToeic.model");
// const Exam = require("../../models/TOEIC/exam.model");

// // Hàm xóa file
// const deleteFile = (filePath) => {
//   if (!filePath) return;

//   try {
//     let normalizedPath = filePath;
//     if (path.isAbsolute(filePath)) {
//       const publicIndex = filePath.indexOf("public");
//       if (publicIndex !== -1) {
//         normalizedPath = filePath.slice(publicIndex + "public".length);
//       } else {
//         normalizedPath = path.basename(filePath);
//       }
//     }

//     normalizedPath = normalizedPath
//       .replace(/^\/admin\/img\/Uploads_writing_TOEIC\//, "/shared/images/writing_TOEIC/")
//       .replace(/^\\shared\\images\\writing_TOEIC\\/, "/shared/images/writing_TOEIC/");

//     const fullPath = path.join(__dirname, "../../public", normalizedPath);
//     if (fs.existsSync(fullPath)) {
//       fs.unlinkSync(fullPath);
//       console.log(`Đã xóa tệp: ${fullPath}`);
//     }
//   } catch (err) {
//     console.error(`Lỗi khi xóa tệp: ${err.message}`);
//   }
// };

// // Hiển thị tất cả câu hỏi
// exports.getAllQuestions = async (req, res) => {
//   try {
//     const questions = await WritingQuestion.find().lean();
//     return res.render("admin/pages/TOEIC/dashboard-questionWritingTOEIC", {
//       questions,
//       difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
//       error: req.flash("error"),
//       success: req.flash("success"),
//     });
//   } catch (error) {
//     console.error("Lỗi lấy danh sách câu hỏi:", error);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/dashboard");
//   }
// };

// // Hiển thị form tạo câu hỏi
// exports.showCreateForm = (req, res) => {
//   return res.render("admin/pages/TOEIC/create-writing-question", {
//     error: req.flash("error"),
//     success: req.flash("success"),
//   });
// };

// // Tạo câu hỏi mới
// exports.createQuestion = async (req, res) => {
//   try {
//     const { MaCC, TopicN, part, questionN, difficulty, notes, ...bodyData } = req.body;
//     const topicNum = parseInt(TopicN);
//     const partNum = parseInt(part);
//     const questionNum = parseInt(questionN);
//     const difficultyLevel = parseInt(difficulty);

//     // Validate dữ liệu cơ bản
//     const requiredFields = { MaCC, TopicN, part, questionN, difficulty };
//     for (const [field, value] of Object.entries(requiredFields)) {
//       if (!value) throw new Error(`Vui lòng điền ${field}`);
//     }

//     if (isNaN(topicNum) || topicNum < 1) throw new Error("Mã Đề phải là số lớn hơn 0.");
//     if (![8, 9, 10].includes(partNum)) throw new Error("Part không hợp lệ. Chỉ chấp nhận 8, 9, hoặc 10.");
//     if (isNaN(questionNum) || questionNum < 1) throw new Error("Số câu hỏi phải lớn hơn 0.");
//     if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
//       throw new Error("Độ Khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
//     }

//     // Kiểm tra trùng lặp
//     const duplicate = await WritingQuestion.findOne({
//       MaCC: MaCC.trim(),
//       TopicN: topicNum,
//       part: partNum,
//       questionN: questionNum,
//     });
//     if (duplicate) throw new Error(`Câu hỏi Part ${partNum} số ${questionNum} đã tồn tại.`);

//     // Validate part cụ thể
//     let questionData = {};
//     switch (partNum) {
//       case 8:
//         if (!bodyData.keyword1?.trim() || !bodyData.keyword2?.trim() || !req.file) {
//           if (req.file) deleteFile(req.file.path);
//           throw new Error("Part 8 yêu cầu 2 từ khóa và 1 hình ảnh.");
//         }
//         questionData.part8 = {
//           keyword1: bodyData.keyword1.trim(),
//           keyword2: bodyData.keyword2.trim(),
//           img: `/shared/images/writing_TOEIC/${req.file.filename}`,
//         };
//         break;

//       case 9:
//         if (!bodyData.situation?.trim() || !bodyData.requirements?.trim()) {
//           throw new Error("Part 9 yêu cầu tình huống và yêu cầu.");
//         }
//         // Chuẩn hóa sampleAnswer thành chuỗi trước khi trim
//         const sampleAnswerPart9 = typeof bodyData.sampleAnswer === "string" ? bodyData.sampleAnswer.trim() : "";
//         questionData.part9 = {
//           situation: bodyData.situation.trim(),
//           requirements: bodyData.requirements.trim(),
//           sampleAnswer: sampleAnswerPart9,
//         };
//         break;

//       case 10:
//         if (!bodyData.question?.trim()) {
//           throw new Error("Part 10 yêu cầu đề bài luận.");
//         }
//         // Chuẩn hóa sampleAnswer thành chuỗi trước khi trim
//         const sampleAnswerPart10 = typeof bodyData.sampleAnswer === "string" ? bodyData.sampleAnswer.trim() : "";
//         questionData.part10 = {
//           question: bodyData.question.trim(),
//           sampleAnswer: sampleAnswerPart10,
//         };
//         break;

//       default:
//         throw new Error("Part không hợp lệ.");
//     }

//     // Tạo và lưu câu hỏi
//     const newQuestion = new WritingQuestion({
//       MaCC: MaCC.trim(),
//       TopicN: topicNum,
//       part: partNum,
//       questionN: questionNum,
//       ...questionData,
//       difficulty: difficultyLevel,
//       notes: notes?.trim() || "",
//     });

//     await newQuestion.save();
//     req.flash("success", "Tạo câu hỏi thành công!");
//     return res.redirect("/admin/toeic-writing");
//   } catch (error) {
//     console.error("Lỗi khi tạo câu hỏi:", error);
//     if (req.file) deleteFile(req.file.path);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/toeic-writing/create");
//   }
// };
// // Hiển thị form chỉnh sửa câu hỏi
// exports.showEditForm = async (req, res) => {
//   try {
//     const question = await WritingQuestion.findById(req.params.id).lean();
//     if (!question) {
//       req.flash("error", "Không tìm thấy câu hỏi.");
//       return res.redirect("/admin/toeic-writing");
//     }
//     return res.render("admin/pages/TOEIC/edit-writing-question", {
//       question,
//       difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
//       error: req.flash("error"),
//       success: req.flash("success"),
//     });
//   } catch (error) {
//     console.error("Lỗi khi tải form chỉnh sửa:", error);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/toeic-writing");
//   }
// };

// // Cập nhật câu hỏi
// exports.updateQuestion = async (req, res) => {
//   try {
//     const { MaCC, TopicN, part, questionN, difficulty, notes, removeImage, ...bodyData } = req.body;
//     const topicNum = parseInt(TopicN);
//     const partNum = parseInt(part);
//     const questionNum = parseInt(questionN);
//     const difficultyLevel = parseInt(difficulty);

//     // Validate dữ liệu cơ bản
//     const requiredFields = { MaCC, TopicN, part, questionN, difficulty };
//     for (const [field, value] of Object.entries(requiredFields)) {
//       if (!value) throw new Error(`Vui lòng điền ${field}`);
//     }

//     if (isNaN(topicNum) || topicNum < 1) throw new Error("Mã Đề phải là số lớn hơn 0.");
//     if (![8, 9, 10].includes(partNum)) throw new Error("Part không hợp lệ. Chỉ chấp nhận 8, 9, hoặc 10.");
//     if (isNaN(questionNum) || questionNum < 1) throw new Error("Số câu hỏi phải lớn hơn 0.");
//     if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
//       throw new Error("Độ Khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
//     }

//     // Kiểm tra trùng lặp
//     const existingQuestion = await WritingQuestion.findOne({
//       MaCC: MaCC.trim(),
//       TopicN: topicNum,
//       part: partNum,
//       questionN: questionNum,
//       _id: { $ne: req.params.id },
//     });
//     if (existingQuestion) throw new Error(`Câu hỏi Part ${partNum} số ${questionNum} đã tồn tại.`);

//     // Xử lý dữ liệu theo part
//     let updateData = {
//       MaCC: MaCC.trim(),
//       TopicN: topicNum,
//       part: partNum,
//       questionN: questionNum,
//       difficulty: difficultyLevel,
//       notes: notes?.trim() || "",
//     };

//     switch (partNum) {
//       case 8:
//         if (!bodyData.keyword1?.trim() || !bodyData.keyword2?.trim()) {
//           if (req.file) deleteFile(req.file.path);
//           throw new Error("Part 8 yêu cầu 2 từ khóa.");
//         }

//         if (removeImage) {
//           const question = await WritingQuestion.findById(req.params.id);
//           if (question?.part8?.img) deleteFile(question.part8.img);
//           updateData["part8.img"] = undefined;
//         }

//         updateData.part8 = {
//           keyword1: bodyData.keyword1.trim(),
//           keyword2: bodyData.keyword2.trim(),
//           ...(req.file && { img: `/shared/images/writing_TOEIC/${req.file.filename}` }),
//         };
//         break;

//       case 9:
//         if (!bodyData.situation?.trim() || !bodyData.requirements?.trim()) {
//           throw new Error("Part 9 yêu cầu tình huống và yêu cầu.");
//         }
//         updateData.part9 = {
//           situation: bodyData.situation.trim(),
//           requirements: bodyData.requirements.trim(),
//           sampleAnswer: bodyData.sampleAnswer?.trim() || "",
//         };
//         break;

//       case 10:
//         if (!bodyData.question?.trim()) {
//           throw new Error("Part 10 yêu cầu đề bài luận.");
//         }
//         updateData.part10 = {
//           question: bodyData.question.trim(),
//           sampleAnswer: bodyData.sampleAnswer?.trim() || "",
//         };
//         break;

//       default:
//         throw new Error("Part không hợp lệ.");
//     }

//     const updatedQuestion = await WritingQuestion.findByIdAndUpdate(
//       req.params.id,
//       { $set: updateData },
//       { new: true }
//     );

//     if (!updatedQuestion) throw new Error("Không tìm thấy câu hỏi để cập nhật.");

//     req.flash("success", "Cập nhật câu hỏi thành công!");
//     return res.redirect("/admin/toeic-writing");
//   } catch (error) {
//     console.error("Lỗi khi cập nhật câu hỏi:", error);
//     if (req.file) deleteFile(req.file.path);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect(`/admin/toeic-writing/edit/${req.params.id}`);
//   }
// };

// // Xóa câu hỏi
// exports.deleteQuestion = async (req, res) => {
//   try {
//     const question = await WritingQuestion.findById(req.params.id);
//     if (!question) throw new Error("Không tìm thấy câu hỏi.");

//     if (question.part === 8 && question.part8?.img) {
//       deleteFile(question.part8.img);
//     }

//     await WritingQuestion.findByIdAndDelete(req.params.id);
//     req.flash("success", "Xóa câu hỏi thành công!");
//     return res.redirect("/admin/toeic-writing");
//   } catch (error) {
//     console.error("Lỗi khi xóa câu hỏi:", error);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/toeic-writing");
//   }
// };

// // Hiển thị câu hỏi theo part
// exports.getQuestionsByPart = async (req, res) => {
//   try {
//     const part = parseInt(req.params.part);
//     if (![8, 9, 10].includes(part)) throw new Error("Part không hợp lệ.");

//     const questions = await WritingQuestion.find({ part }).lean();
//     const partNames = {
//       8: "Part 8 - Viết câu từ hình và từ khóa",
//       9: "Part 9 - Viết email",
//       10: "Part 10 - Viết luận",
//     };

//     return res.render("admin/pages/TOEIC/writing-questions-by-part", {
//       questions,
//       currentPart: part,
//       partNames,
//       difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
//       error: req.flash("error"),
//       success: req.flash("success"),
//     });
//   } catch (error) {
//     console.error("Lỗi lấy câu hỏi theo part:", error);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/toeic-writing");
//   }
// };

// // Hiển thị form tạo đề thi
// exports.showCreateExamForm = async (req, res) => {
//   try {
//     const questions = {
//       part8: await WritingQuestion.find({ part: 8 }).lean(),
//       part9: await WritingQuestion.find({ part: 9 }).lean(),
//       part10: await WritingQuestion.find({ part: 10 }).lean(),
//     };
//     return res.render("admin/pages/TOEIC/create-writing-exam", {
//       questions,
//       error: req.flash("error"),
//       success: req.flash("success"),
//     });
//   } catch (error) {
//     console.error("Lỗi tải form tạo đề thi:", error);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/toeic-writing/exams");
//   }
// };

// // Tạo đề thi
// exports.createExam = async (req, res) => {
//   try {
//     const { MaCC, TopicN, difficulty, part8, part9, part10, notes } = req.body;
//     const topicNum = parseInt(TopicN);
//     const difficultyLevel = parseInt(difficulty);

//     // Validate dữ liệu cơ bản
//     const requiredFields = { MaCC, TopicN, difficulty };
//     for (const [field, value] of Object.entries(requiredFields)) {
//       if (!value) throw new Error(`Vui lòng điền ${field}`);
//     }

//     if (isNaN(topicNum) || topicNum < 1) throw new Error("Mã Đề phải là số lớn hơn 0.");
//     if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
//       throw new Error("Độ Khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
//     }

//     // Chuyển đổi mảng ID từ form
//     const part8Ids = Array.isArray(part8) ? part8 : (part8 ? [part8] : []);
//     const part9Ids = Array.isArray(part9) ? part9 : (part9 ? [part9] : []);
//     const part10Ids = Array.isArray(part10) ? part10 : (part10 ? [part10] : []);

//     if (part8Ids.length > 5) throw new Error("Part 8 chỉ được chọn tối đa 5 câu.");
//     if (part9Ids.length > 2) throw new Error("Part 9 chỉ được chọn tối đa 2 câu.");
//     if (part10Ids.length > 1) throw new Error("Part 10 chỉ được chọn tối đa 1 câu.");

//     // Lấy các câu hỏi từ database dựa trên ID
//     const questions = await WritingQuestion.find({
//       _id: { $in: [...part8Ids, ...part9Ids, ...part10Ids] },
//     }).lean();

//     if (questions.length !== (part8Ids.length + part9Ids.length + part10Ids.length)) {
//       throw new Error("Một hoặc nhiều câu hỏi không tồn tại.");
//     }

//     // Tạo và lưu đề thi
//     const newExam = new Exam({
//       MaCC: MaCC.trim(),
//       TopicN: topicNum,
//       difficulty: difficultyLevel,
//       notes: notes?.trim() || "",
//       questions: questions.map(q => q._id), // Lưu ID của các câu hỏi
//     });

//     await newExam.save();

//     req.flash("success", "Tạo đề thi thành công!");
//     return res.redirect("/admin/toeic-writing/exams");
//   } catch (error) {
//     console.error("Lỗi khi tạo đề thi:", error);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/toeic-writing/exams/create");
//   }
// };

// // Hiển thị danh sách đề thi
// exports.getExams = async (req, res) => {
//   try {
//     const exams = await Exam.find().lean();
//     return res.render("admin/pages/TOEIC/writing-exam-list", {
//       exams,
//       difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
//       error: req.flash("error"),
//       success: req.flash("success"),
//     });
//   } catch (error) {
//     console.error("Lỗi lấy danh sách đề thi:", error);
//     req.flash("error", `Lỗi: ${error.message}`);
//     return res.redirect("/admin/toeic-writing");
//   }
// };
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const WritingQuestion = require("../../models/TOEIC/writingTOEIC.model");

// Hàm xóa file
const deleteFile = (filePath) => {
  if (!filePath) return;

  try {
    let normalizedPath = filePath;
    if (path.isAbsolute(filePath)) {
      const publicIndex = filePath.indexOf("public");
      if (publicIndex !== -1) {
        normalizedPath = filePath.slice(publicIndex + "public".length);
      } else {
        normalizedPath = path.basename(filePath);
      }
    }

    normalizedPath = normalizedPath
      .replace(/^\/admin\/img\/Uploads_writing_TOEIC\//, "/shared/images/writing_TOEIC/")
      .replace(/^\\shared\\images\\writing_TOEIC\\/, "/shared/images/writing_TOEIC/");

    const fullPath = path.join(__dirname, "../../public", normalizedPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`Đã xóa tệp: ${fullPath}`);
    }
  } catch (err) {
    console.error(`Lỗi khi xóa tệp: ${err.message}`);
  }
};

// Hiển thị tất cả câu hỏi
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await WritingQuestion.find().lean();
    return res.render("admin/pages/TOEIC/dashboard-questionWritingTOEIC", {
      questions,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách câu hỏi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/dashboard");
  }
};

// Hiển thị form tạo câu hỏi
exports.showCreateForm = (req, res) => {
  return res.render("admin/pages/TOEIC/create-writing-question", {
    error: req.flash("error"),
    success: req.flash("success"),
  });
};

// Tạo câu hỏi mới
exports.createQuestion = async (req, res) => {
  try {
    const { MaCC, TopicN, part, questionN, difficulty, notes, ...bodyData } = req.body;
    const topicNum = parseInt(TopicN);
    const partNum = parseInt(part);
    const questionNum = parseInt(questionN);
    const difficultyLevel = parseInt(difficulty);

    // Validate dữ liệu cơ bản
    const requiredFields = { MaCC, TopicN, part, questionN, difficulty };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) throw new Error(`Vui lòng điền ${field}`);
    }

    if (isNaN(topicNum) || topicNum < 1) throw new Error("Mã Đề phải là số lớn hơn 0.");
    if (![8, 9, 10].includes(partNum)) throw new Error("Part không hợp lệ. Chỉ chấp nhận 8, 9, hoặc 10.");
    if (isNaN(questionNum) || questionNum < 1) throw new Error("Số câu hỏi phải lớn hơn 0.");
    if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
      throw new Error("Độ Khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
    }

    // Kiểm tra trùng lặp
    const duplicate = await WritingQuestion.findOne({
      MaCC: MaCC.trim(),
      TopicN: topicNum,
      part: partNum,
      questionN: questionNum,
    });
    if (duplicate) throw new Error(`Câu hỏi Part ${partNum} số ${questionNum} đã tồn tại.`);

    // Validate part cụ thể
    let questionData = {};
    switch (partNum) {
      case 8:
        if (!bodyData.keyword1?.trim() || !bodyData.keyword2?.trim() || !req.file) {
          if (req.file) deleteFile(req.file.path);
          throw new Error("Part 8 yêu cầu 2 từ khóa và 1 hình ảnh.");
        }
        questionData.part8 = {
          keyword1: bodyData.keyword1.trim(),
          keyword2: bodyData.keyword2.trim(),
          img: `/shared/images/writing_TOEIC/${req.file.filename}`,
        };
        break;

      case 9:
        if (!bodyData.situation?.trim() || !bodyData.requirements?.trim()) {
          throw new Error("Part 9 yêu cầu tình huống và yêu cầu.");
        }
        const sampleAnswerPart9 = typeof bodyData.sampleAnswer === "string" ? bodyData.sampleAnswer.trim() : "";
        questionData.part9 = {
          situation: bodyData.situation.trim(),
          requirements: bodyData.requirements.trim(),
          sampleAnswer: sampleAnswerPart9,
        };
        break;

      case 10:
        if (!bodyData.question?.trim()) {
          throw new Error("Part 10 yêu cầu đề bài luận.");
        }
        const sampleAnswerPart10 = typeof bodyData.sampleAnswer === "string" ? bodyData.sampleAnswer.trim() : "";
        questionData.part10 = {
          question: bodyData.question.trim(),
          sampleAnswer: sampleAnswerPart10,
        };
        break;

      default:
        throw new Error("Part không hợp lệ.");
    }

    // Tạo và lưu câu hỏi
    const newQuestion = new WritingQuestion({
      MaCC: MaCC.trim(),
      TopicN: topicNum,
      part: partNum,
      questionN: questionNum,
      ...questionData,
      difficulty: difficultyLevel,
      notes: notes?.trim() || "",
    });

    await newQuestion.save();
    req.flash("success", "Tạo câu hỏi thành công!");
    return res.redirect("/admin/toeic-writing");
  } catch (error) {
    console.error("Lỗi khi tạo câu hỏi:", error);
    if (req.file) deleteFile(req.file.path);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing/create");
  }
};

// Hiển thị form chỉnh sửa câu hỏi
exports.showEditForm = async (req, res) => {
  try {
    const question = await WritingQuestion.findById(req.params.id).lean();
    if (!question) {
      req.flash("error", "Không tìm thấy câu hỏi.");
      return res.redirect("/admin/toeic-writing");
    }
    return res.render("admin/pages/TOEIC/edit-writing-question", {
      question,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (error) {
    console.error("Lỗi khi tải form chỉnh sửa:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing");
  }
};

// Cập nhật câu hỏi
exports.updateQuestion = async (req, res) => {
  try {
    const { MaCC, TopicN, part, questionN, difficulty, notes, removeImage, ...bodyData } = req.body;
    const topicNum = parseInt(TopicN);
    const partNum = parseInt(part);
    const questionNum = parseInt(questionN);
    const difficultyLevel = parseInt(difficulty);

    // Validate dữ liệu cơ bản
    const requiredFields = { MaCC, TopicN, part, questionN, difficulty };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) throw new Error(`Vui lòng điền ${field}`);
    }

    if (isNaN(topicNum) || topicNum < 1) throw new Error("Mã Đề phải là số lớn hơn 0.");
    if (![8, 9, 10].includes(partNum)) throw new Error("Part không hợp lệ. Chỉ chấp nhận 8, 9, hoặc 10.");
    if (isNaN(questionNum) || questionNum < 1) throw new Error("Số câu hỏi phải lớn hơn 0.");
    if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
      throw new Error("Độ Khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
    }

    // Kiểm tra trùng lặp
    const existingQuestion = await WritingQuestion.findOne({
      MaCC: MaCC.trim(),
      TopicN: topicNum,
      part: partNum,
      questionN: questionNum,
      _id: { $ne: req.params.id },
    });
    if (existingQuestion) throw new Error(`Câu hỏi Part ${partNum} số ${questionNum} đã tồn tại.`);

    // Xử lý dữ liệu theo part
    let updateData = {
      MaCC: MaCC.trim(),
      TopicN: topicNum,
      part: partNum,
      questionN: questionNum,
      difficulty: difficultyLevel,
      notes: notes?.trim() || "",
    };

    switch (partNum) {
      case 8:
        if (!bodyData.keyword1?.trim() || !bodyData.keyword2?.trim()) {
          if (req.file) deleteFile(req.file.path);
          throw new Error("Part 8 yêu cầu 2 từ khóa.");
        }

        if (removeImage) {
          const question = await WritingQuestion.findById(req.params.id);
          if (question?.part8?.img) deleteFile(question.part8.img);
          updateData["part8.img"] = undefined;
        }

        updateData.part8 = {
          keyword1: bodyData.keyword1.trim(),
          keyword2: bodyData.keyword2.trim(),
          ...(req.file && { img: `/shared/images/writing_TOEIC/${req.file.filename}` }),
        };
        break;

      case 9:
        if (!bodyData.situation?.trim() || !bodyData.requirements?.trim()) {
          throw new Error("Part 9 yêu cầu tình huống và yêu cầu.");
        }
        updateData.part9 = {
          situation: bodyData.situation.trim(),
          requirements: bodyData.requirements.trim(),
          sampleAnswer: bodyData.sampleAnswer?.trim() || "",
        };
        break;

      case 10:
        if (!bodyData.question?.trim()) {
          throw new Error("Part 10 yêu cầu đề bài luận.");
        }
        updateData.part10 = {
          question: bodyData.question.trim(),
          sampleAnswer: bodyData.sampleAnswer?.trim() || "",
        };
        break;

      default:
        throw new Error("Part không hợp lệ.");
    }

    const updatedQuestion = await WritingQuestion.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!updatedQuestion) throw new Error("Không tìm thấy câu hỏi để cập nhật.");

    req.flash("success", "Cập nhật câu hỏi thành công!");
    return res.redirect("/admin/toeic-writing");
  } catch (error) {
    console.error("Lỗi khi cập nhật câu hỏi:", error);
    if (req.file) deleteFile(req.file.path);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect(`/admin/toeic-writing/edit/${req.params.id}`);
  }
};

// Xóa câu hỏi
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await WritingQuestion.findById(req.params.id);
    if (!question) throw new Error("Không tìm thấy câu hỏi.");

    if (question.part === 8 && question.part8?.img) {
      deleteFile(question.part8.img);
    }

    await WritingQuestion.findByIdAndDelete(req.params.id);
    req.flash("success", "Xóa câu hỏi thành công!");
    return res.redirect("/admin/toeic-writing");
  } catch (error) {
    console.error("Lỗi khi xóa câu hỏi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing");
  }
};

// Hiển thị câu hỏi theo part
exports.getQuestionsByPart = async (req, res) => {
  try {
    const part = parseInt(req.params.part);
    if (![8, 9, 10].includes(part)) throw new Error("Part không hợp lệ.");

    const questions = await WritingQuestion.find({ part }).lean();
    const partNames = {
      8: "Part 8 - Viết câu từ hình và từ khóa",
      9: "Part 9 - Viết email",
      10: "Part 10 - Viết luận",
    };

    return res.render("admin/pages/TOEIC/writing-questions-by-part", {
      questions,
      currentPart: part,
      partNames,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (error) {
    console.error("Lỗi lấy câu hỏi theo part:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing");
  }
};