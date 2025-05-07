// File này định nghĩa các route cho phần transcription của client
const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/transcription.controller');
const path = require('path');
// Thêm dòng này để phục vụ file tĩnh
router.get('/', controller.listAll);
router.get('/:id', controller.playAndCompare);
router.post('/:id', controller.checkTranscript);
module.exports = router;