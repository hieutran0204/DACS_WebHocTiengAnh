const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/CRUD_writingTOEIC.controller');
const upload = require('../../middlewares/uploadMulti.middleware'); // Sửa tên middleware

router.get('/create', controller.showCreateForm);
router.post('/create', upload.any(), controller.createWritingQuestions);
router.get('/', controller.listWritingQuestions);
router.get('/edit/:id', controller.showEditForm);
router.post('/edit/:id', upload.any(), controller.updateWritingQuestion);
router.post('/delete/:id', controller.deleteWritingQuestion);

module.exports = router;