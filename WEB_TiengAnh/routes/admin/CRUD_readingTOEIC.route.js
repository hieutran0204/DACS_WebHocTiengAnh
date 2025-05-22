const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/admin/CRUD_readingTOEIC.controller");
const { uploadReading, handleReadingError } = require("../../middlewares/uploadReading.middleware");

// Route hiển thị toàn bộ câu hỏi
router.get("/", questionController.getAllQuestions);

// Route tạo câu hỏi
router.get("/create", questionController.showCreateForm);
router.post("/add", uploadReading.single("image"), handleReadingError, questionController.createQuestion);

// Route chỉnh sửa câu hỏi
router.get("/edit/:id", questionController.showEditForm);
router.post("/update/:id", uploadReading.single("image"), handleReadingError, questionController.updateQuestion);

// Route lấy câu hỏi theo phần
router.get("/by-part/:part", questionController.getQuestionsByPart);

// Route tìm kiếm
router.get("/search", questionController.showSearchForm);
router.get("/search-results", questionController.searchQuestions);

// Route xóa câu hỏi
router.get("/delete/:id", questionController.deleteQuestion);

// Route tạo đề thi ngẫu nhiên
router.post("/generate-random", questionController.generateRandomExam);

// Các route liên quan đến exam
router.get("/exams", questionController.getAllExams);
router.get("/exams/create", questionController.showCreateFormExam);
router.get("/exams/:id", questionController.getExamDetail);
router.delete("/exams/:id", questionController.deleteExam);

module.exports = router;