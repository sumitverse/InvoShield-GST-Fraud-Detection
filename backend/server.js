const express = require('express');
const cors = require('cors');
const { PORT } = require('./config/env');
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const gstinRoutes = require('./routes/gstinRoutes');

const app = express();
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'file://'],
  credentials: true
}));

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/gstin', gstinRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'InvoShield Backend API',
    endpoints: {
      login: 'POST /api/auth/login',
      logout: 'POST /api/auth/logout',
      dashboardStats: 'GET /api/dashboard/stats',
      dashboardAnalytics: 'GET /api/dashboard/analytics',
      health: 'GET /api/health'
    }
  });
});

// koi bhi error pe
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

app.listen(PORT, () => {
  console.log(`Backend Server Chal raha hai.. http://localhost:${PORT}`);
});
