const express = require('express');
const router = express.Router();
const coverController = require('../../controllers/client/cover.controller');

router.get('/', coverController.getCoverPage);

module.exports = router;
