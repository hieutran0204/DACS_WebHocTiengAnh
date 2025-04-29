const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/client/home.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const toeicRoute = require("./toeic.route");
const coverRoute = require('./cover.route');
const newsRoute = require('./news.route'); // <- thêm dòng này

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