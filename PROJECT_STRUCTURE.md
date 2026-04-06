# InvoShield - Project Structure

## Complete Folder Organization

```
Capstone Project/
├── backend/                      # Node.js Express Backend
│   ├── config/
│   │   └── env.js               # Environment variables
│   ├── controllers/             # Business logic
│   │   ├── authController.js    # Login/Logout logic
│   │   └── dashboardController.js # Dashboard stats logic
│   ├── middleware/              # Express middleware
│   │   └── authMiddleware.js    # JWT token verification
│   ├── models/                  # Data models
│   │   └── User.js              # User data structure
│   ├── routes/                  # API routes
│   │   ├── authRoutes.js        # Auth endpoints
│   │   └── dashboardRoutes.js   # Dashboard endpoints
│   ├── utils/                   # Helper functions
│   │   └── tokenUtils.js        # JWT token generation
│   ├── .env                     # Environment config (NOT in git)
│   ├── .gitignore               # Git ignore rules
│   ├── package.json             # Dependencies
│   ├── server.js                # Main server file
│   └── README.md                # Backend docs
│
├── frontend/                     # Frontend (React/Vanilla JS)
│   ├── js/
│   │   ├── auth-api.js          # Authenticated API client
│   │   ├── login.js             # Login page logic
│   │   └── utils.js             # Common utilities
│   ├── css/                     # Stylesheets
│   ├── assets/                  # Images, icons
│   └── public/                  # Static files
│
├── pages/                        # HTML Pages (TEMPORARY - Move to frontend/public)
│   ├── login.html               # Login page
│   ├── dashboard.html           # Dashboard page
│   ├── analytics.html           # Analytics page
│   ├── invoices.html            # Invoices page
│   ├── gstin-lookup.html        # GSTIN lookup page
│   ├── fraud-alert.html         # Fraud alerts page
│   ├── login.css
│   ├── dashboard.css
│   ├── analytics.css
│   └── ... (other CSS files)
│
├── .git/                         # Git repository
├── .github/                      # GitHub configs
├── README.md                     # Project documentation
└── .gitignore                    # Global git ignore
```

## Key Components Explained

### Backend Structure (MVC Pattern)

1. **`config/env.js`** - Centralized configuration
   - Environment variables
   - Database config
   - API settings

2. **`models/User.js`** - Data models
   - User schema
   - Mock database
   - Will integrate with real DB

3. **`controllers/`** - Business logic
   - `authController.js`: Handles login, logout
   - `dashboardController.js`: Handles stats, analytics
   - Each controller exports functions for routes

4. **`middleware/authMiddleware.js`** - Request middleware
   - JWT token verification
   - Protected route checking
   - Error handling

5. **`routes/`** - API endpoints
   - `authRoutes.js`: `/api/auth/login`, `/api/auth/logout`
   - `dashboardRoutes.js`: `/api/dashboard/stats`, `/api/dashboard/analytics`

6. **`utils/tokenUtils.js`** - Helper functions
   - Token generation
   - Encoding/decoding
   - Validation functions

### Frontend Structure

1. **`js/auth-api.js`** - API client class
   - Authenticated fetch wrapper
   - Token management
   - Error handling

2. **`js/login.js`** - Login page handler
   - Form validation
   - API calls
   - Error messages

3. **`js/utils.js`** - Common utilities
   - Format functions
   - Toast notifications
   - Auth checks

## API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Dashboard (`/api/dashboard`)
- `GET /api/dashboard/stats` - Get dashboard statistics (Protected)
- `GET /api/dashboard/analytics` - Get analytics data (Protected)

### Health
- `GET /api/health` - Server health check
- `GET /` - API info

## How to Run

### Backend
```bash
cd backend
npm install
npm start
```

### Frontend
Open `pages/login.html` in browser (use Live Server for development)

## Authentication Flow

1. User submits login form
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials
4. Backend returns JWT token
5. Frontend stores token in localStorage
6. Frontend makes authenticated requests with token in Authorization header
7. Middleware verifies token for protected routes

## Next Steps

1. **Move pages to frontend/public**: Copy all HTML files from pages/ to frontend/public/
2. **Unify CSS**: Move all CSS files to frontend/css/
3. **Add database**: Replace User.js mock data with MongoDB/MySQL queries
4. **Environment setup**: Update .env with real secrets
5. **Error handling**: Add try-catch blocks and error logging
6. **Input validation**: Add request validation middleware
7. **Rate limiting**: Add rate limiting for API endpoints

## Important Files to Update

- `backend/.env` - Change JWT_SECRET in production
- `frontend/js/auth-api.js` - Update API_URL for production
- Database connections - Add real database integration
