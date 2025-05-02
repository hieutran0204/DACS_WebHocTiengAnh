const express = require('express');
const router = express.Router();
const listeningController = require('../../controllers/admin/CRUD_listeningTOEIC.controller');
const uploadMulti = require('../../middlewares/uploadMulti.middleware');

// Định tuyến cho các thao tác CRUD
router.get('/', listeningController.getAllQuestions);
router.get('/create', listeningController.showCreateForm);
router.post('/create', uploadMulti.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'diagram', maxCount: 1 }
]), listeningController.createListeningQuestion);
router.get('/edit/:id', listeningController.showEditForm);
router.post('/update/:id', uploadMulti.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'diagram', maxCount: 1 }
]), listeningController.updateQuestion);
router.get('/delete/:id', listeningController.deleteQuestion);
router.get('/part/:part', listeningController.getQuestionsByPart);

module.exports = router;