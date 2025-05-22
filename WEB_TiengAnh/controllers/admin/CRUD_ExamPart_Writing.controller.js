// File này chứa các hàm xử lý CRUD cho phần thi viết của TOEIC
const mongoose = require("mongoose");
const ExamPart_Writing = require("../../models/TOEIC/ExamPart_Writing.model");
const WritingQuestion = require("../../models/TOEIC/writingTOEIC.model");

// Hiển thị form tạo đề thi
exports.showCreateExamForm = async (req, res) => {
  try {
    const questions = {
      part8: await WritingQuestion.find({ part: 8 }).lean(),
      part9: await WritingQuestion.find({ part: 9 }).lean(),
      part10: await WritingQuestion.find({ part: 10 }).lean(),
    };
    return res.render("admin/pages/TOEIC/create-writing-exam", {
      questions,
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (error) {
    console.error("Lỗi tải form tạo đề thi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing/exams");
  }
};

// Tạo đề thi
exports.createExam = async (req, res) => {
  try {
    const { MaCC, TopicN, difficulty, part8, part9, part10, notes } = req.body;
    const adminId = req.user._id; // Lấy ID của admin từ req.user
    const topicNum = parseInt(TopicN);
    const difficultyLevel = parseInt(difficulty);

    // Validate dữ liệu cơ bản
    const requiredFields = { MaCC, TopicN, difficulty };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) throw new Error(`Vui lòng điền ${field}`);
    }

    if (isNaN(topicNum) || topicNum < 1) throw new Error("Mã Đề phải là số lớn hơn 0.");
    if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
      throw new Error("Độ Khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
    }

    // Chuyển đổi mảng ID từ form
    const part8Ids = Array.isArray(part8) ? part8 : (part8 ? [part8] : []);
    const part9Ids = Array.isArray(part9) ? part9 : (part9 ? [part9] : []);
    const part10Ids = Array.isArray(part10) ? part10 : (part10 ? [part10] : []);

    if (part8Ids.length > 5) throw new Error("Part 8 chỉ được chọn tối đa 5 câu.");
    if (part9Ids.length > 2) throw new Error("Part 9 chỉ được chọn tối đa 2 câu.");
    if (part10Ids.length > 1) throw new Error("Part 10 chỉ được chọn tối đa 1 câu.");

    // Lấy các câu hỏi từ database dựa trên ID
    const questions = await WritingQuestion.find({
      _id: { $in: [...part8Ids, ...part9Ids, ...part10Ids] },
    }).lean();

    if (questions.length !== (part8Ids.length + part9Ids.length + part10Ids.length)) {
      throw new Error("Một hoặc nhiều câu hỏi không tồn tại.");
    }

    // Tạo và lưu đề thi
    const newExam = new ExamPart_Writing({
      examCode: MaCC.trim(),
      MaCC: MaCC.trim(),
      TopicN: topicNum,
      difficulty: difficultyLevel,
      notes: notes?.trim() || "",
      questions: questions.map(q => q._id),
      createdBy: adminId, // Lưu ID của admin
      status: "draft", // Mặc định là draft
    });

    await newExam.save();

    req.flash("success", "Tạo đề thi thành công!");
    return res.redirect("/admin/toeic-writing/exams");
  } catch (error) {
    console.error("Lỗi khi tạo đề thi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing/exams/create");
  }
};

// Hiển thị danh sách đề thi
exports.getExams = async (req, res) => {
  try {
    // Populate questions và createdBy
    const exams = await ExamPart_Writing.find()
      .populate("questions", "part")
      .populate("createdBy", "username")
      .lean();

    // Thêm questionCount và parts cho mỗi exam
    const examsWithDetails = exams.map(exam => {
      const questions = Array.isArray(exam.questions) ? exam.questions : [];
      const parts = questions
        .filter(q => q && typeof q.part === "number")
        .map(q => q.part);
      return {
        ...exam,
        questionCount: questions.length,
        parts: [...new Set(parts)],
      };
    });

    return res.render("admin/pages/TOEIC/writing-exam-list", {
      exams: examsWithDetails,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      statusMap: { draft: "Bản nháp", public: "Công khai" },
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (error) {
    console.error("Lỗi lấy danh sách đề thi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing");
  }
};

// Xóa đề thi
exports.deleteExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const deletedExam = await ExamPart_Writing.findByIdAndDelete(examId);
    if (!deletedExam) {
      throw new Error("Đề thi không tồn tại.");
    }
    req.flash("success", "Xóa đề thi thành công!");
    return res.redirect("/admin/toeic-writing/exams");
  } catch (error) {
    console.error("Lỗi khi xóa đề thi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing/exams");
  }
};

// Hiển thị chi tiết đề thi
exports.getExamDetail = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await ExamPart_Writing.findById(examId)
      .populate("questions")
      .populate("createdBy", "username")
      .lean();

    if (!exam) {
      throw new Error("Đề thi không tồn tại.");
    }

    // Tính toán questionCount và parts
    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    const parts = questions
      .filter(q => q && typeof q.part === "number")
      .map(q => q.part);

    const examWithDetails = {
      ...exam,
      questionCount: questions.length,
      parts: [...new Set(parts)],
    };

    // Lấy danh sách tất cả câu hỏi để hiển thị trong form chỉnh sửa
    const allQuestions = {
      part8: await WritingQuestion.find({ part: 8 }).lean(),
      part9: await WritingQuestion.find({ part: 9 }).lean(),
      part10: await WritingQuestion.find({ part: 10 }).lean(),
    };

    return res.render("admin/pages/TOEIC/writing-exam-detail", {
      exam: examWithDetails,
      allQuestions,
      difficultyMap: { 0: "Dễ", 1: "Trung bình", 2: "Khó" },
      statusMap: { draft: "Bản nháp", public: "Công khai" },
      error: req.flash("error"),
      success: req.flash("success"),
    });
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết đề thi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing/exams");
  }
};

// Cập nhật đề thi
exports.updateExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const { examCode, MaCC, TopicN, difficulty, part8, part9, part10, notes, status } = req.body;
    const topicNum = parseInt(TopicN);
    const difficultyLevel = parseInt(difficulty);

    // Validate dữ liệu cơ bản
    const requiredFields = { examCode, MaCC, TopicN, difficulty };
    for (const [field, value] of Object.entries(requiredFields)) {
      if (!value) throw new Error(`Vui lòng điền ${field}`);
    }

    if (isNaN(topicNum) || topicNum < 1) throw new Error("Mã Đề phải là số lớn hơn 0.");
    if (isNaN(difficultyLevel) || ![0, 1, 2].includes(difficultyLevel)) {
      throw new Error("Độ Khó không hợp lệ. Chỉ chấp nhận 0 (Dễ), 1 (Trung bình), 2 (Khó).");
    }

    if (!["draft", "public"].includes(status)) {
      throw new Error("Trạng Thái không hợp lệ. Chỉ chấp nhận draft hoặc public.");
    }

    // Chuyển đổi mảng ID từ form
    const part8Ids = Array.isArray(part8) ? part8 : (part8 ? [part8] : []);
    const part9Ids = Array.isArray(part9) ? part9 : (part9 ? [part9] : []);
    const part10Ids = Array.isArray(part10) ? part10 : (part10 ? [part10] : []);

    if (part8Ids.length > 5) throw new Error("Part 8 chỉ được chọn tối đa 5 câu.");
    if (part9Ids.length > 2) throw new Error("Part 9 chỉ được chọn tối đa 2 câu.");
    if (part10Ids.length > 1) throw new Error("Part 10 chỉ được chọn tối đa 1 câu.");

    // Lấy các câu hỏi từ database dựa trên ID
    const questions = await WritingQuestion.find({
      _id: { $in: [...part8Ids, ...part9Ids, ...part10Ids] },
    }).lean();

    if (questions.length !== (part8Ids.length + part9Ids.length + part10Ids.length)) {
      throw new Error("Một hoặc nhiều câu hỏi không tồn tại.");
    }

    // Cập nhật đề thi
    const updatedExam = await ExamPart_Writing.findByIdAndUpdate(
      examId,
      {
        examCode: examCode.trim(),
        MaCC: MaCC.trim(),
        TopicN: topicNum,
        difficulty: difficultyLevel,
        notes: notes?.trim() || "",
        questions: questions.map(q => q._id),
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedExam) {
      throw new Error("Đề thi không tồn tại.");
    }

    req.flash("success", "Cập nhật đề thi thành công!");
    return res.redirect(`/admin/toeic-writing/exams`);
  } catch (error) {
    console.error("Lỗi khi cập nhật đề thi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect(`/admin/toeic-writing/exams/${examId}`);
  }
};

// Công khai đề thi
exports.publishExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await ExamPart_Writing.findById(examId);
    if (!exam) {
      throw new Error("Đề thi không tồn tại.");
    }

    exam.status = "public";
    await exam.save();

    req.flash("success", "Đề thi đã được công khai thành công!");
    return res.redirect("/admin/toeic-writing/exams");
  } catch (error) {
    console.error("Lỗi khi công khai đề thi:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing/exams");
  }
  
};

// Chuyển về bản nháp
exports.draftExam = async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await ExamPart_Writing.findById(examId);
    if (!exam) {
      throw new Error("Đề thi không tồn tại.");
    }

    exam.status = "draft";
    await exam.save();

    req.flash("success", "Đề thi đã được chuyển về bản nháp thành công!");
    return res.redirect("/admin/toeic-writing/exams");
  } catch (error) {
    console.error("Lỗi khi chuyển về bản nháp:", error);
    req.flash("error", `Lỗi: ${error.message}`);
    return res.redirect("/admin/toeic-writing/exams");
  }
};