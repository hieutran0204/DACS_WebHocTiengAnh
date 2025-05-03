const express = require('express');
const router = express.Router();
const controller = require('../../controllers/admin/hiddenWord.controller');
const upload = require('../../middlewares/upload.middleware'); // multer

router.get('/create', controller.getCreateForm);
router.post('/create', upload.single('image'), controller.createHiddenWord);
router.get('/list', controller.getHiddenWordList);
router.get('/delete/:id', controller.deleteHiddenWord); // Thêm route xóa

module.exports = router;
