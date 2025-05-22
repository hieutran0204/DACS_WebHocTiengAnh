const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/admin/CRUD_writingTOEIC.controller");
const examController = require("../../controllers/admin/CRUD_ExamPart_Writing.controller");
const uploadWriting = require("../../middlewares/uploadWriting.middleware");

// Middleware validate yêu cầu cơ bản
const validateRequest = (req, res, next) => {
  const { MaCC, TopicN, part, questionN, difficulty } = req.body;
  if (!MaCC || !TopicN || !part || !questionN || !difficulty) {
    return res.status(400).json({ error: "Vui lòng điền đầy đủ thông tin bắt buộc." });
  }
  if (![8, 9, 10].includes(parseInt(part))) {
    return res.status(400).json({ error: "Part không hợp lệ. Chỉ chấp nhận 8, 9, hoặc 10." });
  }
  next();
};

// Route danh sách câu hỏi
router.get("/", questionController.getAllQuestions);

// Route hiển thị form tạo câu hỏi
router.get("/create", questionController.showCreateForm);

// Route tạo mới câu hỏi
router.post(
  "/add",
  uploadWriting.uploadWriting,
  uploadWriting.handleWritingError,
  validateRequest,
  questionController.createQuestion
);

// Route hiển thị form chỉnh sửa câu hỏi
router.get("/edit/:id", questionController.showEditForm);

// Route cập nhật câu hỏi
router.post(
  "/update/:id",
  uploadWriting.uploadWriting,
  uploadWriting.handleWritingError,
  validateRequest,
  questionController.updateQuestion
);

// Route xóa câu hỏi
router.delete("/delete/:id", questionController.deleteQuestion);

// Route xem câu hỏi theo part
router.get("/by-part/:part", questionController.getQuestionsByPart);

// Route danh sách đề thi
router.get("/exams", examController.getExams);

// Route hiển thị form tạo đề thi
router.get("/exams/create", examController.showCreateExamForm);

// Route tạo đề thi mới
router.post(
  "/exams/add",
  uploadWriting.uploadWriting,
  uploadWriting.handleWritingError,
  examController.createExam
);

// Route xem chi tiết đề thi
router.get("/exams/:id", examController.getExamDetail);

// Route cập nhật đề thi
router.post(
  "/exams/update/:id",
  uploadWriting.uploadWriting,
  uploadWriting.handleWritingError,
  examController.updateExam
);

// Route xóa đề thi
router.get("/exams/delete/:id", examController.deleteExam);

// Route công khai đề thi
router.post("/exams/:id/publish", examController.publishExam);

// Route chuyển về bản nháp
router.post("/exams/:id/draft", examController.draftExam);

module.exports = router;