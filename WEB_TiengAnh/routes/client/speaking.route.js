const express = require('express');
const router = express.Router();
const Speaking = require('../../models/TOEIC/speaking.model');

// Hiển thị danh sách đề Speaking
router.get('/', async (req, res) => {
  const speeches = await Speaking.find();
  res.render('client/pages/speaking-list', { speeches });
});

// Hiển thị trang luyện nói
router.get('/practice/:id', async (req, res) => {
  const speech = await Speaking.findById(req.params.id);
  res.render('client/pages/speaking-practice', { speech });
});

module.exports = router;