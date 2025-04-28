const express = require('express');
const router = express.Router();

// const dashboardRouterAdmin = require('./dashboard.route.js');
const authMiddleware = require('../../middlewares/auth.middleware.js');
// Sử dụng tên route ngắn gọn hơn
// router.use('/',
//     authMiddleware.verifyToken, 
//     authMiddleware.isAdmin,
//     dashboardController.index);          // → /admin/
// router.use('/reading', readingTOEICRouter);    // → /admin/reading
// Đầu tiên bảo vệ bằng middleware
router.use(authMiddleware.verifyToken, authMiddleware.isAdmin);

// Gắn route dashboard riêng
router.use('/', require('./dashboard.route'));

// Gắn các route khác
router.use('/reading', require('./CRUD_readingTOEIC.route'));
router.use('/listening', require('./CRUD_listeningTOEIC.route'));
router.use('/exam', require('./CRUD_TOEIC_Part.route'));

module.exports = router;