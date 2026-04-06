# Backend Developer Guide

## Quick Start

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:5000`

## Project Structure

```
backend/
├── config/env.js          # Configuration
├── controllers/           # Business logic
├── middleware/            # Request middleware
├── models/                # Data models
├── routes/                # API routes
├── utils/                 # Helper functions
├── server.js              # Entry point
├── package.json           # Dependencies
└── .env                   # Environment variables
```

## Adding a New Feature

### 1. Create a Controller (`controllers/invoiceController.js`)
```javascript
exports.getInvoices = (req, res) => {
  res.json({ success: true, data: [] });
};
```

### 2. Create Routes (`routes/invoiceRoutes.js`)
```javascript
const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/list', verifyToken, invoiceController.getInvoices);
module.exports = router;
```

### 3. Import in `server.js`
```javascript
const invoiceRoutes = require('./routes/invoiceRoutes');
app.use('/api/invoices', invoiceRoutes);
```

## API Response Format

Always return this format:
```json
{
  "success": true,
  "message": "Success message",
  "data": { /* your data */ }
}
```

For errors:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Available Middleware

- `verifyToken`: Checks JWT token, protects routes

Usage:
```javascript
router.get('/protected', verifyToken, controller.method);
```

## Database Integration

Replace User.js mock data with real queries:

```javascript
// Current (mock)
const user = users.find(u => u.email === email);

// With MongoDB
const user = await User.findOne({ email });

// With MySQL
const user = await db.query('SELECT * FROM users WHERE email = ?', [email]);
```

## Environment Variables

Edit `.env`:
- `PORT`: Server port
- `JWT_SECRET`: JWT signing secret
- `NODE_ENV`: development/production
- Add database URL: `DATABASE_URL`

## Testing Endpoints

### Using cURL
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"officer@gst.gov.in","password":"test123"}'
```

### Using Postman
1. Create collection
2. Add requests for each endpoint
3. Set Authorization bearer token

## Common Issues

### Port already in use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

### CORS errors
Add origin to CORS config in server.js

### Token expired
- Clear localStorage in frontend
- Get new token by logging in again

## Production Checklist

- [ ] Change JWT_SECRET
- [ ] Set NODE_ENV=production
- [ ] Add input validation
- [ ] Implement rate limiting
- [ ] Use HTTPS
- [ ] Store secrets in environment variables
- [ ] Add error logging
- [ ] Setup database backup
