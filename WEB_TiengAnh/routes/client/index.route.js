const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/client/home.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const toeicRoute = require("./toeic.route");
const newsRoute = require('./news.route'); // <- thêm dòng này
const speakingRoutes = require('./speaking.route');

router.use('/speaking', speakingRoutes);
router.use("/toeic", toeicRoute);

// --- Route chính ---
router.get('/', homeController.renderHomePage);       // Trang chủ không cần auth
router.use('/news', newsRoute); 
router.use('/transcription', require('./transcription.route'));

// --- Route bảo mật ---
router.get('/dashboard', 
  authMiddleware.verifyToken, 
  homeController.renderDashboard
);

// // --- API endpoints ---
// router.get('/api/home/stats', homeController.getHomeStats); // API lấy thống kê

module.exports = router;