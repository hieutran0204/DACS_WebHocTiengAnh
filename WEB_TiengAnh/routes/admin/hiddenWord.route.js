const express = require('express');
const router = express.Router();
const hiddenWordController = require('../../controllers/admin/hiddenWord.controller');
const upload = require('../../middlewares/upload.middleware'); // multer
// Các route hiện có
router.get('/create', hiddenWordController.getCreateForm);
router.post('/create', upload.single('image'), hiddenWordController.createHiddenWord);
router.get('/', hiddenWordController.getHiddenWordList);
router.delete('/:id', hiddenWordController.deleteHiddenWord);

// Route mới cho chỉnh sửa
router.get('/edit/:id', hiddenWordController.getEditForm);
router.post('/update/:id', upload.single('image'), hiddenWordController.updateHiddenWord);

module.exports = router;
