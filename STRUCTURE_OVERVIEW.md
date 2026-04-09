# Project Structure Overview

## Complete Directory Tree

```
Capstone Project/
│
├── 📁 backend/                          ← Node.js Express Server
│   ├── 📁 config/
│   │   └── env.js                       ← Environment configuration
│   │
│   ├── 📁 controllers/                  ← Business logic
│   │   ├── authController.js            ← Login/Logout
│   │   └── dashboardController.js       ← Stats & Analytics
│   │
│   ├── 📁 middleware/                   ← Express middleware
│   │   └── authMiddleware.js            ← JWT verification
│   │
│   ├── 📁 models/                       ← Data models
│   │   └── User.js                      ← User data (mock → DB)
│   │
│   ├── 📁 routes/                       ← API endpoints
│   │   ├── authRoutes.js                ← /api/auth/*
│   │   └── dashboardRoutes.js           ← /api/dashboard/*
│   │
│   ├── 📁 utils/                        ← Helper functions
│   │   └── tokenUtils.js                ← JWT generation
│   │
│   ├── 📄 .env                          ← Environment vars
│   ├── 📄 .gitignore                    ← Git ignore
│   ├── 📄 package.json                  ← Dependencies
│   ├── 📄 server.js                     ← Entry point
│   ├── 📄 README.md                     ← API docs
│   └── 📄 DEVELOPER_GUIDE.md            ← Backend dev guide
│
├── 📁 frontend/                         ← Frontend utilities
│   ├── 📁 js/
│   │   ├── auth-api.js                  ← API client class
│   │   ├── login.js                     ← Login page handler
│   │   └── utils.js                     ← Common utilities
│   ├── 📁 css/                          ← Stylesheets (empty)
│   ├── 📁 assets/                       ← Images, icons (empty)
│   └── 📁 public/                       ← Static files (empty)
│
├── 📁 pages/                            ← HTML pages (MOVE to frontend/public)
│   ├── login.html                       ← Login page (linked to frontend/js/login.js)
│   ├── dashboard.html
│   ├── analytics.html
│   ├── invoices.html
│   ├── gstin-lookup.html
│   ├── fraud-alert.html
│   ├── login.css
│   ├── dashboard.css
│   ├── analytics.css
│   └── ... (other CSS files)
│
├── 📁 .git/                             ← Git repository
├── 📁 .github/                          ← GitHub configs
│
├── 📄 README-NEW.md                     ← Main documentation
├── 📄 PROJECT_STRUCTURE.md              ← Structure explanation
├── 📄 FRONTEND_DEVELOPER_GUIDE.md       ← Frontend guide
└── 📄 .gitignore                        ← Global git ignore

```

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Browser)                       │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  HTML Pages (login.html, dashboard.html, etc.)           │   │
│  │  └─ Uses: auth-api.js, utils.js, login.js               │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                  HTTP/JWT Token
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│                    BACKEND (Node.js/Express)                     │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  server.js (Entry Point)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│              │                        │                          │
│              ▼                        ▼                          │
│  ┌─────────────────────┐  ┌────────────────────────┐            │
│  │  Routes             │  │ Middleware             │            │
│  │ ├─ authRoutes       │  │ ├─ verifyToken        │            │
│  │ └─ dashboardRoutes  │  │ └─ errorHandler       │            │
│  └─────────────────────┘  └────────────────────────┘            │
│              │                        │                          │
│              ▼                        ▼                          │
│  ┌─────────────────────┐  ┌────────────────────────┐            │
│  │  Controllers        │  │ Utils                  │            │
│  │ ├─ authController   │  │ ├─ tokenUtils         │            │
│  │ └─ dashboardCtrl    │  │ └─ validators         │            │
│  └─────────────────────┘  └────────────────────────┘            │
│              │                                                    │
│              ▼                                                    │
│  ┌─────────────────────┐                                         │
│  │  Models             │                                         │
│  │ └─ User.js (Mock)   │ ← Replace with DB later                │
│  └─────────────────────┘                                         │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Login Flow
```
1. User fills login form
   └─> HTML (login.html)
   
2. Form submission
   └─> JavaScript (login.js)
   
3. API Request
   └─> POST /api/auth/login (auth-api.js)
   
4. Backend Processing
   ├─> router receives request (authRoutes.js)
   ├─> controller handles logic (authController.js)
   └─> returns JWT token
   
5. Frontend stores token
   └─> localStorage.authToken
   
6. Redirect to dashboard
   └─> GET /api/dashboard/stats (with token)
   
7. Backend verifies token
   ├─> middleware checks (authMiddleware.js)
   ├─> passes to controller
   └─> returns protected data
   
8. Display data
   └─> Update dashboard.html
```

## Feature Organization

### Authentication
- **Route**: `authRoutes.js`
- **Controller**: `authController.js`
- **Middleware**: `authMiddleware.js`
- **Utility**: `tokenUtils.js`
- **Model**: `User.js`

### Dashboard
- **Route**: `dashboardRoutes.js`
- **Controller**: `dashboardController.js`
- **Frontend**: `dashboard.html`

## How to Extend

### Add a new API endpoint
1. Create controller method in `controllers/newController.js`
2. Create route in `routes/newRoutes.js`
3. Import route in `server.js`
4. Use in frontend with `authAPI.get('/endpoint')`

### Add a new page
1. Create HTML in `frontend/public/`
2. Include `auth-api.js` and `utils.js`
3. Check authentication
4. Use `authAPI` to fetch data

## File Purposes

| File | Purpose | Modifies |
|------|---------|----------|
| `server.js` | App entry point | Never |
| `config/env.js` | Configuration | .env file |
| `controllers/*` | Business logic | As needed |
| `routes/*` | API paths | As needed |
| `middleware/authMiddleware.js` | Token check | Not often |
| `models/User.js` | User data | Replace with DB |
| `utils/tokenUtils.js` | Token gen | Not often |
| `frontend/js/auth-api.js` | API client | If API changes |
| `frontend/js/utils.js` | Helpers | Add utilities |

## Status

✅ Backend structure complete
✅ Frontend utilities ready
✅ Authentication working
⏳ Frontend pages (move from /pages to /frontend/public)
⏳ Database integration (replace User.js mock data)
⏳ Additional features
