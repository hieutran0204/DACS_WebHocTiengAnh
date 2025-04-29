const express = require('express');
const router = express.Router();
const coverController = require('../../controllers/client/cover.controller');
const mongoose = require('mongoose');
router.get('/', coverController.getCoverPage);

module.exports = router;
