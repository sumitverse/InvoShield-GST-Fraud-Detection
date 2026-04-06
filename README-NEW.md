# InvoShield - GST Fraud Detection Platform

AI-powered GST invoice fraud detection system for Indian tax authorities.

## Quick Start

### Backend Setup
```bash
cd backend
npm install
npm start
```
Backend runs on `http://localhost:5000`

### Frontend
Open `pages/login.html` in a browser (use Live Server for development)

## Default Credentials
- Email: `officer@gst.gov.in`
- Password: `test123`

## Documentation

- [Project Structure](PROJECT_STRUCTURE.md) - Complete folder organization
- [Backend Guide](backend/DEVELOPER_GUIDE.md) - Backend development
- [Frontend Guide](FRONTEND_DEVELOPER_GUIDE.md) - Frontend development
- [Backend API Docs](backend/README.md) - API documentation

## Features

- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ Login/Logout functionality
- ✅ Dashboard statistics
- ✅ Analytics endpoint
- ✅ Error handling
- ✅ CORS enabled

## Tech Stack

### Backend
- Node.js
- Express.js
- JWT (JSON Web Tokens)
- bcryptjs (password hashing)

### Frontend
- Vanilla JavaScript
- HTML5
- CSS3
- Local Storage API

## Project Structure

```
backend/              # Node.js/Express backend
├── config/           # Configuration files
├── controllers/      # Business logic
├── middleware/       # Authentication middleware
├── models/           # Data models
├── routes/           # API routes
├── utils/            # Helper functions
└── server.js         # Entry point

frontend/             # Frontend files
├── js/               # JavaScript utilities
├── css/              # Stylesheets
└── assets/           # Images & icons

pages/                # HTML pages (move to frontend/public)
```

See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for detailed organization.

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Dashboard (Protected)
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/analytics` - Analytics data

### Health
- `GET /api/health` - Server health check
- `GET /` - API information

## Next Steps

1. Move `pages/` to `frontend/public/`
2. Integrate real database (MongoDB/MySQL)
3. Add input validation
4. Implement rate limiting
5. Setup CI/CD pipeline
6. Deploy to production

## Environment Variables

Create `backend/.env`:
```
PORT=5000
JWT_SECRET=your-secret-key-change-this
NODE_ENV=development
```

## Development

### Backend
See [backend/DEVELOPER_GUIDE.md](backend/DEVELOPER_GUIDE.md)

### Frontend
See [FRONTEND_DEVELOPER_GUIDE.md](FRONTEND_DEVELOPER_GUIDE.md)

## Troubleshooting

**Port already in use** - Change PORT in backend/.env or kill the process using port 5000

**CORS errors** - Ensure frontend URL is in CORS whitelist in server.js

**Login failing** - Use: `officer@gst.gov.in` / `test123`

**Server not responding** - Run `npm start` in backend directory

## Security Notes

⚠️ Production checklist:
- Change JWT_SECRET to strong random value
- Use HTTPS
- Set NODE_ENV=production
- Use secure HTTP-only cookies
- Enable rate limiting
- Add input validation
- Use real database

## License

© 2024 InvoShield. All rights reserved.
