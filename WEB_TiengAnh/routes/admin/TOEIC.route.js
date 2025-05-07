const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../../middlewares/auth.middleware');
const readingExamController = require('../../controllers/admin/CRUD_ExamPart_Reading.controller');
const listeningExamController = require('../../controllers/admin/CRUD_ExamPart_Listening.controller');

// Routes cho Reading TOEIC
router.get('/exam-reading', verifyToken, isAdmin, readingExamController.getAllExamParts);
router.get('/exam-reading/create', verifyToken, isAdmin, readingExamController.showCreateForm);
router.post('/exam-reading/create', verifyToken, isAdmin, readingExamController.createExamPart);
router.get('/exam-reading/:id', verifyToken, isAdmin, readingExamController.showExamPartDetail);
router.get('/exam-reading/delete/:id', verifyToken, isAdmin, readingExamController.deleteExamPart);

// Routes cho Listening TOEIC
router.get('/exam-listening', verifyToken, isAdmin, listeningExamController.getAllExamParts);
router.get('/exam-listening/create', verifyToken, isAdmin, listeningExamController.showCreateForm);
router.post('/exam-listening/create', verifyToken, isAdmin, listeningExamController.createExamPart);
router.get('/exam-listening/:id', verifyToken, isAdmin, listeningExamController.showExamPartDetail);
router.get('/exam-listening/delete/:id', verifyToken, isAdmin, listeningExamController.deleteExamPart);
// Router cho việc thay đổi trạng thái công khai của đề thi
router.post('/TOEIC/exam-reading/publish/:id', verifyToken, isAdmin, readingExamController.publishExamPart);
router.post('/TOEIC/exam-listening/publish/:id', verifyToken, isAdmin, listeningExamController.publishExamPart);

module.exports = router;