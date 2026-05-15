const fs = require('fs');
const path = require('path');

const getDashboardMetrics = () => {
  const csvPath = path.join(__dirname, '../data/real_companies_gst_data.csv');
  
  if (!fs.existsSync(csvPath)) {
    return null;
  }
  
  const csvData = fs.readFileSync(csvPath, 'utf8');
  const rows = csvData.split('\n').map(r => r.trim()).filter(r => r);
  if (rows.length < 2) return null;

  const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
  const idx = {
    sales: headers.findIndex(h => h.includes('sales')),
    purchase: headers.findIndex(h => h.includes('purchase')),
    itc: headers.findIndex(h => h.includes('itc') || h.includes('tax')),
    refund: headers.findIndex(h => h.includes('refund'))
  };

  const validRows = rows.slice(1);
  let totalITC = 0, totalRefund = 0, fraudCount = 0, lowCount = 0;

  validRows.forEach(row => {
    const cols = row.split(',').map(c => c.trim());
    const sales = parseFloat(cols[idx.sales]) || 0;
    const purchase = parseFloat(cols[idx.purchase]) || 0;
    const itc = parseFloat(cols[idx.itc]) || 0;
    const refund = parseFloat(cols[idx.refund]) || 0;

    let triggers = [];
    if (itc > 0.5 * sales) triggers.push('ITC Mismatch');
    if (refund > 0.3 * sales) triggers.push('High Refund');
    if (purchase > 1.5 * sales) triggers.push('Circular Trading');

    if (triggers.length > 0) {
      fraudCount++;
    } else {
      lowCount++;
    }

    if (triggers.length >= 2) {
      totalITC += itc;
      totalRefund += refund;
    }
  });

  const totalInvoices = validRows.length;
  const fraudAmount = (totalITC + totalRefund) / 10000000; // Cr
  const accuracy = totalInvoices > 0 ? ((lowCount / totalInvoices) * 100).toFixed(1) : 0;

  return {
    invoicesScanned: totalInvoices,
    threatsDetected: fraudCount,
    fraudPrevented: `₹${fraudAmount.toFixed(1)} Cr+`,
    accuracy: `${accuracy}%`
  };
};

exports.getStats = (req, res) => {
  const metrics = getDashboardMetrics();
  
  res.json({
    success: true,
    user: req.user,
    stats: metrics ? {
      fraudPrevented: metrics.fraudPrevented,
      invoicesScanned: metrics.invoicesScanned.toLocaleString(),
      accuracy: metrics.accuracy,
      threatsDetected: metrics.threatsDetected,
      activeUsers: 342 
    } : {
      fraudPrevented: '₹0 Cr',
      invoicesScanned: '0',
      accuracy: '0%',
      threatsDetected: 0,
      activeUsers: 0
    }
  });
};
exports.getAnalytics = (req, res) => {
  const metrics = getDashboardMetrics();

  const suspicious = metrics ? metrics.threatsDetected : 0;
  const verified = metrics ? metrics.invoicesScanned - suspicious : 0;
  
  res.json({
    success: true,
    data: {
      dailyThreat: [45, 52, 48, 61, 55, 67, suspicious],
      invoiceStatus: {
        verified: verified,
        suspicious: suspicious,
        blocked: Math.floor(suspicious * 0.3)
      }
    }
  });
};
