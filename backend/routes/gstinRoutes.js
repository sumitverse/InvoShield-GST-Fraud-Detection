const express = require('express');
const router = express.Router();
const gstinController = require('../controllers/gstinController');

router.get('/lookup/:id', gstinController.lookupGSTIN);

module.exports = router;
