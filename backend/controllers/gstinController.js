const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'data', 'real_companies_gst_data.csv');

exports.lookupGSTIN = (req, res) => {
  const gstinId = req.params.id;
  
  if (!gstinId || gstinId.length !== 15) {
    return res.status(400).json({ success: false, message: 'Invalid GSTIN format. Must be 15 characters.' });
  }

  try {
    if (!fs.existsSync(dataFile)) {
      return res.status(500).json({ success: false, message: 'Database file not found.' });
    }

    const data = fs.readFileSync(dataFile, 'utf8');
    const lines = data.split('\n');
    
    // First line is headers: GSTIN,Company,Sales,Purchase,ITC,Refund
    // We want to find the line that starts with the given gstinId
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',');
      if (cols[0] === gstinId) {
        // Found the company
        return res.json({
          success: true,
          data: {
            gstin: cols[0],
            companyName: cols[1].replace(/"/g, ''), // Remove quotes
            sales: parseInt(cols[2], 10),
            purchase: parseInt(cols[3], 10),
            itc: parseInt(cols[4], 10),
            refund: parseInt(cols[5], 10),
            // Calculate a mock risk score based on refund vs itc
            riskScore: (parseInt(cols[5], 10) > parseInt(cols[4], 10) * 0.8) ? 'HIGH' : 'LOW'
          }
        });
      }
    }

    // Not found
    return res.status(404).json({ success: false, message: 'GSTIN not found in the registry.' });

  } catch (error) {
    console.error('Error reading GSTIN data:', error);
    return res.status(500).json({ success: false, message: 'Server error while searching registry.' });
  }
};
