const express = require('express');
const router = express.Router();
const db = require('../utils/db');

// Serve CSV data
router.get('/csv', (req, res) => {
  try {
    const csvData = db.getCSVData();
    res.setHeader('Content-Type', 'text/csv');
    res.send(csvData);
  } catch (error) {
    console.error('Error reading CSV file:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading CSV file'
    });
  }
});

// Save new invoice
router.post('/invoices', (req, res) => {
  try {
    const { id, gstin, entity, amount } = req.body;
    
    // Validate required fields
    if (!id || !gstin || !entity || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    // Create CSV line with proper format
    const csvLine = `${gstin},"${entity}",${amount},0,0,0`;
    
    // Save invoice to our in-memory CSV manager
    db.appendCSVLine(csvLine);
    
    console.log('New invoice added to CSV:', { id, gstin, entity, amount });
    
    res.json({
      success: true,
      message: 'Invoice added successfully and saved to CSV'
    });
  } catch (error) {
    console.error('Error saving invoice to CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving invoice to CSV'
    });
  }
});

module.exports = router;
