// const express = require("express");
// const router = express.Router();
// const toeicClientController = require("../../controllers/client/toeic.controller");

// router.get("/", toeicClientController.showExams);

// module.exports = router;

const express = require("express");
const router = express.Router();
const toeicClientController = require("../../controllers/client/toeic.controller");

router.get("/", toeicClientController.showExams);

module.exports = router;