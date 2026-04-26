const express = require('express');
const router = express.Router();
const gstinController = require('../controllers/gstinController');

// GET /api/gstin/lookup/:id
router.get('/lookup/:id', gstinController.lookupGSTIN);

module.exports = router;
