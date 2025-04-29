const express = require('express');
const router = express.Router();
const newsController = require('../../controllers/client/news.controller');
const mongoose = require('mongoose');

// Middleware kiểm tra ObjectId
const validateObjectId = (req, res, next) => {
    if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).render('client/pages/error', { 
        message: 'ID bài viết không hợp lệ' 
      });
    }
    next();
  };
  

router.get('/', newsController.getNews);
router.get('/:id', validateObjectId, newsController.getNewsDetail);

module.exports = router;