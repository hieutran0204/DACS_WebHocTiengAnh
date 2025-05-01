const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/wordgame.controller');

// Giao diện admin thêm từ
router.get('/create', controller.viewWords);
router.post('/create', controller.createWord);
router.get('/delete/:id', controller.deleteWord);

module.exports = router;
