const express = require('express');
const router = express.Router();
const WordGame = require('../../models/TOEIC/wordgame.model');

// Lấy từ ngẫu nhiên cho người chơi
router.get('/random', async (req, res) => {
  const count = await WordGame.countDocuments();
  const random = Math.floor(Math.random() * count);
  const word = await WordGame.findOne().skip(random).lean();
  res.json(word);
});
router.get('/', (req, res) => {
    res.render('client/pages/wordgame');
});
  
module.exports = router;
