const express = require('express');
const router = express.Router();
const examPartController = require('../../controllers/admin/CRUD_TOEIC_Part.controller');

// Xem danh sách đề thi
router.get('/', examPartController.getAllExamParts);

// Tạo đề thi mới
router.post('/create', examPartController.createExamPart);

// Cập nhật đề thi
router.put('/:examPartId', examPartController.updateExamPart);

// Xóa đề thi
router.delete('/:examPartId', examPartController.deleteExamPart);

// Công khai đề thi
router.patch('/:examPartId/publish', examPartController.publishExamPart);

module.exports = router;