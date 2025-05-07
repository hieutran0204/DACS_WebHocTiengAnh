// File này dùng để định nghĩa các route cho việc quản lý câu hỏi TOEIC Reading
const express = require("express");
const router = express.Router();
const questionController = require("../../controllers/admin/CRUD_readingTOEIC.controller");
const upload = require("../../middlewares/upload.middleware");

// Route chính nên dùng "/" thay vì "/questions"
router.get("/", questionController.getAllQuestions);
router.get("/create", questionController.showCreateForm);
router.post("/add", upload.single("image"), questionController.createQuestion);

// Các route khác giữ nguyên nhưng bỏ "/questions" ở đầu
router.get("/edit/:id", questionController.showEditForm);
router.post("/update/:id", upload.single("image"), questionController.updateQuestion);
router.get("/by-part/:part", questionController.getQuestionsByPart);
router.get("/generate-random", questionController.generateRandomExam);
router.get("/search", questionController.showSearchForm);
router.get("/search-results", questionController.searchQuestions);
router.get("/delete/:id", questionController.deleteQuestion);

// Route về exam nên tách sang file riêng nếu nhiều
router.get("/exams", questionController.getAllExams);
router.get("/exams/create", questionController.showCreateFormExam);
router.get("/exams/:id", questionController.getExamDetail);
router.delete("/exams/:id", questionController.deleteExam);

module.exports = router;