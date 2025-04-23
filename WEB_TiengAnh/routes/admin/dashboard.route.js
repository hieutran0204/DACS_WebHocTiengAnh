const express = require("express");
const router = express.Router();
const dashboardController = require("../../controllers/admin/dashboard.controller");

// Khớp chính xác với các route đã khai báo trong index.js
router.get("/dashboard", dashboardController.index); // GET /admin/dashboard
router.get("/dashboard_TOEIC", dashboardController.getDashboard_TOEIC); // GET /admin/dashboard_TOEIC
router.get("/redirect/:examType", dashboardController.redirectExamType); // GET /admin/redirect/:examType



module.exports = router;