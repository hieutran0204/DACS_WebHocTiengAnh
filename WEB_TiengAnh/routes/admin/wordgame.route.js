const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/wordgame.controller');

// Giao diện admin thêm từ
router.get('/create', controller.viewWords);
router.post('/create', controller.createWord);
router.get('/delete/:id', controller.deleteWord);
// Giao diện chỉnh sửa từ
router.get('/edit/:id', controller.editWord);

// Xử lý cập nhật từ
router.post('/update/:id', controller.updateWord);
module.exports = router;
