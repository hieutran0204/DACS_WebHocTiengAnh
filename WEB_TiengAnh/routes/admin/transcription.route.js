const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/transcription.controller');
const uploadMulti = require('../../middlewares/uploadMulti.middleware');

router.get('/create', (req, res) => res.render('admin/pages/TOEIC/transcription-create'));
router.post('/create', uploadMulti.fields([{ name: 'audio', maxCount: 1 }]), controller.createTranscription);
router.get('/list', controller.listTranscriptions);
router.get('/delete/:id', controller.deleteTranscription);

module.exports = router;
