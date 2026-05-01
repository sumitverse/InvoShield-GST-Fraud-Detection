const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Serve CSV data
router.get('/csv', (req, res) => {
  try {
    const csvPath = path.join(__dirname, '../data/real_companies_gst_data.csv');
    
    if (!fs.existsSync(csvPath)) {
      return res.status(404).json({
        success: false,
        message: 'CSV file not found'
      });
    }
    
    const csvData = fs.readFileSync(csvPath, 'utf8');
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
    const csvPath = path.join(__dirname, '../data/real_companies_gst_data.csv');
    
    // Ensure file exists and has proper format
    try {
      const existingData = fs.readFileSync(csvPath, 'utf8');
      if (existingData.trim() === '') {
        // If file is empty, add header
        fs.writeFileSync(csvPath, 'GSTIN,Company,Sales,Purchase,ITC,Refund');
      }
    } catch (err) {
      // If file doesn't exist, create it with header
      fs.writeFileSync(csvPath, 'GSTIN,Company,Sales,Purchase,ITC,Refund');
    }
    
    // Append the new invoice to the file
    fs.appendFileSync(csvPath, '\n' + csvLine);
    
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
