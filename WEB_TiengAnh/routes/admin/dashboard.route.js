const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");

// Khớp chính xác với các route đã khai báo trong index.js
// router.get("/dashboard", dashboardController.index); // Giữ nguyên nếu cần dashboard chung
router.get("/dashboard", dashboardController.getDashboard_TOEIC); // Hiển thị thống kê TOEIC
router.get("/redirect/:examType", dashboardController.redirectExamType); // Chuyển hướng dựa trên examType
// Thêm route DELETE cho /admin/exam/:examId
router.delete("/exam/:examId", dashboardController.deleteExam);
module.exports = router;