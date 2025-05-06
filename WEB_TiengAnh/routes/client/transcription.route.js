// const express = require('express');
// const router = express.Router();
// const controller = require('../../controllers/client/transcription.controller');

// router.get('/', controller.listAll);               // danh sách đề
// router.get('/:id', controller.playAndCompare);     // giao diện nghe
// router.post('/:id', controller.checkTranscript);   // so sánh transcript


const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/transcription.controller');
const path = require('path');

// Thêm dòng này để phục vụ file tĩnh


router.get('/', controller.listAll);
router.get('/:id', controller.playAndCompare);
router.post('/:id', controller.checkTranscript);
module.exports = router;
