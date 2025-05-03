const express = require('express');
const router = express.Router();

// Trang menu game chính
router.get('/', (req, res) => {
  res.render('client/pages/menu-game', {
    pageTitle: 'Menu Game'
  });
});

module.exports = router;