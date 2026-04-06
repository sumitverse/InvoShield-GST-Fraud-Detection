// Dashboard stats controller
exports.getStats = (req, res) => {
  res.json({
    success: true,
    user: req.user,
    stats: {
      fraudPrevented: '₹4.8 Cr+',
      invoicesScanned: '2.3M+',
      accuracy: '99.7%',
      threatsDetected: 1204,
      activeUsers: 342
    }
  });
};

// Get analytics
exports.getAnalytics = (req, res) => {
  res.json({
    success: true,
    data: {
      dailyThreat: [45, 52, 48, 61, 55, 67, 72],
      invoiceStatus: {
        verified: 1250,
        suspicious: 89,
        blocked: 23
      }
    }
  });
};
