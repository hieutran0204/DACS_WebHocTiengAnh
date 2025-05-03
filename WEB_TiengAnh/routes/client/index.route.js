const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/client/home.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const toeicRoute = require("./toeic.route");
const coverRoute = require('./cover.route');
const newsRoute = require('./news.route'); // <- thêm dòng này
const wordgameRoute = require('./wordgame.route');
const hiddenWordRoute = require('./hiddenWord.route'); // Thêm dòng này

// ... các import khác
const menuGameRoute = require('./menugame.route');

// ... các route khác
router.use('/menugame', menuGameRoute); // Sử dụng '/games' làm URL chính
// ... các route khác ...

router.use('/hidden-word', hiddenWordRoute); // Thêm dòng này

router.use('/game', wordgameRoute);

// <- mount route tin tức

router.use("/toeic", toeicRoute);
router.use('/', coverRoute); 
// --- Route chính ---
router.use('/news', newsRoute); 

// --- Route bảo mật ---
router.get('/dashboard', 
  authMiddleware.verifyToken, 
  homeController.renderDashboard
);

// // --- API endpoints ---
// router.get('/api/home/stats', homeController.getHomeStats); // API lấy thống kê

module.exports = router;