const express = require('express');
const router = express.Router();
const listeningController = require('../../controllers/admin/CRUD_listeningTOEIC.controller');
const upload = require('../../middlewares/uploadAudio.middleware');

// Lấy danh sách tất cả câu hỏi listening
router.get('/', listeningController.getAllListeningQuestions);

// Hiển thị form tạo mới câu hỏi listening
router.get('/create', listeningController.getCreateListeningQuestion);

// Xử lý tạo mới câu hỏi (form submit)
router.post('/create', upload.single('audio'), listeningController.createListeningQuestion);

// Hiển thị form chỉnh sửa câu hỏi
router.get('/edit/:id', listeningController.getEditListeningQuestion);

// Xử lý cập nhật câu hỏi
router.post('/edit/:id', upload.single('audio'), listeningController.updateListeningQuestion);

// Xử lý xóa câu hỏi
router.get('/delete/:id', listeningController.deleteListeningQuestion);

module.exports = router;
