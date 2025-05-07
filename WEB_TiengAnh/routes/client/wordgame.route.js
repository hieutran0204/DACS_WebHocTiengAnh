const express = require('express');
const router = express.Router();
const wordGameController = require('../../controllers/client/wordgame.controller');

// Route để lấy từ ngẫu nhiên
router.get('/', wordGameController.getRandomWord);
router.post('/check', wordGameController.checkAnswer);

module.exports = router;