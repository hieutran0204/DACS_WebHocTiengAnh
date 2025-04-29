const express = require('express');
const router = express.Router();
const listeningController = require('../../controllers/admin/CRUD_listeningTOEIC.controller');
const uploadMulti = require('../../middlewares/uploadMulti.middleware');
const upload = require('../../middlewares/upload.middleware');

// Định tuyến cho các thao tác CRUD
router.get('/', listeningController.getAllQuestions); // Lấy danh sách câu hỏi
router.get('/create', listeningController.showCreateForm); // Hiển thị form tạo câu hỏi (gây lỗi ENOENT)
router.post('/create', uploadMulti.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'diagram', maxCount: 1 }
]), listeningController.createListeningQuestion); // Tạo câu hỏi mới với upload file
router.get('/edit/:id', listeningController.showEditForm); // Hiển thị form chỉnh sửa
router.post('/update/:id', uploadMulti.fields([
    { name: 'audio', maxCount: 1 },
    { name: 'image', maxCount: 1 },
    { name: 'diagram', maxCount: 1 }
]), listeningController.updateQuestion); // Cập nhật câu hỏi với upload file
router.get('/delete/:id', listeningController.deleteQuestion); // Xóa câu hỏi
router.get('/part/:part', listeningController.getQuestionsByPart); // Lấy câu hỏi theo phần

module.exports = router;