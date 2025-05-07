
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/hiddenWord.controller');

router.get('/', controller.playGame);
router.post('/check', controller.checkGuess);
router.get('/random', controller.getRandomWord);

module.exports = router;
