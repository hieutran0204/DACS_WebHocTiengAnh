const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middlewares/auth.middleware.js');

// Đầu tiên bảo vệ bằng middleware
router.use(authMiddleware.verifyToken, authMiddleware.isAdmin);

// Gắn các route
router.use('/', require('./dashboard.route'));
router.use('/reading', require('./CRUD_readingTOEIC.route'));
router.use('/listening', require('./CRUD_listeningTOEIC.route'));
router.use('/news', require('./news.route'));
router.use('/wordgame', require('./wordgame.route'));
router.use('/TOEIC', require('./TOEIC.route'));
router.use('/users', require('./users.route'));

module.exports = router;