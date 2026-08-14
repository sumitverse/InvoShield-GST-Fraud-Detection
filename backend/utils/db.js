const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '../data/real_companies_gst_data.csv');
let csvDataInMemory = '';

// Load initial CSV data
try {
  if (fs.existsSync(csvPath)) {
    csvDataInMemory = fs.readFileSync(csvPath, 'utf8');
  } else {
    // Setup default structure if it doesn't exist
    csvDataInMemory = 'GSTIN,Company,Sales,Purchase,ITC,Refund';
  }
} catch (err) {
  console.error('Error loading initial CSV data into memory:', err);
  csvDataInMemory = 'GSTIN,Company,Sales,Purchase,ITC,Refund';
}

function getCSVData() {
  return csvDataInMemory;
}

function appendCSVLine(line) {
  // Normalize and append to in-memory data
  if (csvDataInMemory.trim() === '') {
    csvDataInMemory = 'GSTIN,Company,Sales,Purchase,ITC,Refund';
  }
  
  csvDataInMemory = csvDataInMemory.trimEnd() + '\n' + line;

  // Attempt to write to file system for local persistence, but catch errors on read-only environments (Vercel)
  try {
    fs.appendFileSync(csvPath, '\n' + line);
    console.log('Successfully persisted new data line to CSV file.');
  } catch (err) {
    console.warn('Could not write to disk (likely read-only serverless environment):', err.message);
  }
}

module.exports = {
  getCSVData,
  appendCSVLine
};
