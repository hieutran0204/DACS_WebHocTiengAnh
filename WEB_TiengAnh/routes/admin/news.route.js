const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/admin/news.controller');

// Đặt route tĩnh (/list) TRƯỚC route động (/:id)
router.get('/list', newsController.getNewsList);  // Đưa lên đầu các route GET

router.get('/create', newsController.getCreateNews);
router.post('/create', newsController.postCreateNews);
router.get('/edit/:id', newsController.getEditNews);
router.post('/edit/:id', newsController.postEditNews);
router.delete('/delete/:id', newsController.deleteNews);

module.exports = router;