const express = require('express');
const router = express.Router();
const speakingController = require('../../controllers/admin/speaking.controller');
router.get('/create', speakingController.createForm); // Form tạo mới
router.post('/create', speakingController.create);    // Xử lý tạo mới
router.get('/', speakingController.list);
router.post('/delete/:id', speakingController.delete);

module.exports = router;