const express = require('express');
const router = express.Router();
const PublicReadingExams = require('../../controllers/client/toeic_reading.controller');
const PublicListeningExams = require('../../controllers/client/toeic_listening.controller');
const PublicWritingExams = require('../../controllers/client/toeic_writing.controller');

// Danh sách đề
router.get('/reading-list', PublicReadingExams.getExamReadingList);
router.get('/listening-list', PublicListeningExams.getExamListeningList);
router.get('/writing-list', PublicWritingExams.getExamWritingList);

// Đề cụ thể
router.get('/reading/:id', PublicReadingExams.getPublicReadingExams);
router.post('/reading/:id/submit', PublicReadingExams.submitReadingExam);
router.get('/listening/:id', PublicListeningExams.getPublicListeningExams);
router.post('/listening/:id/submit', PublicListeningExams.submitListeningExam);
router.get('/writing/:id', PublicWritingExams.getPublicWritingExams);
router.post('/writing/:id/submit', PublicWritingExams.submitWritingExam);

module.exports = router;