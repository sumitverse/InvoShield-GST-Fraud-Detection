# Quick Reference Guide

## 🚀 Start Backend
```bash
cd backend
npm start
```
✅ Running on `http://localhost:5000`

## 📂 Folder Structure (What We Created)

```
✅ backend/         → MVC architecture with modules
✅ frontend/        → Frontend utilities & scripts
❌ pages/           → MOVE to frontend/public/ (next step)
```

## 📝 Documentation Files

Read these in order:
1. **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Overall organization
2. **[STRUCTURE_OVERVIEW.md](STRUCTURE_OVERVIEW.md)** - Visual diagrams
3. **[backend/DEVELOPER_GUIDE.md](backend/DEVELOPER_GUIDE.md)** - Backend dev
4. **[FRONTEND_DEVELOPER_GUIDE.md](FRONTEND_DEVELOPER_GUIDE.md)** - Frontend dev
5. **[backend/README.md](backend/README.md)** - API endpoints

## 🔑 Backend Key Files

| File | Purpose |
|------|---------|
| `server.js` | Main entry point |
| `config/env.js` | Configuration |
| `controllers/` | Business logic |
| `routes/` | API endpoints |
| `middleware/` | Middleware (JWT check) |
| `models/User.js` | User data |
| `utils/` | Helpers |

## 💻 Frontend Key Files

| File | Purpose |
|------|---------|
| `frontend/js/auth-api.js` | API client class |
| `frontend/js/login.js` | Login handler |
| `frontend/js/utils.js` | Utilities |
| `pages/login.html` | Login page (using login.js) |

## 🔐 Login Credentials

- **Email**: `officer@gst.gov.in`
- **Password**: `test123`

## 🌐 API Endpoints

### Public
- `GET /` - API info
- `GET /api/health` - Health check
- `POST /api/auth/login` - Login

### Protected (Need JWT token)
- `GET /api/dashboard/stats` - Dashboard stats
- `GET /api/dashboard/analytics` - Analytics
- `POST /api/auth/logout` - Logout

## 🎯 Adding New Features

### Backend Feature
1. Create controller in `backend/controllers/`
2. Create routes in `backend/routes/`
3. Import routes in `server.js`
4. Use in frontend with `authAPI`

### Frontend Page
1. Create HTML file
2. Include `auth-api.js` and `utils.js`
3. Check: `if (!authAPI.isLoggedIn()) redirect`
4. Fetch data using `authAPI.get('/endpoint')`

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Port 5000 in use | Kill process or change PORT in .env |
| "Cannot GET /" | Backend running, try /api/health |
| CORS error | Check allowed origins in server.js |
| Login fails | Verify credentials: officer@gst.gov.in / test123 |
| Token issues | Clear localStorage, login again |

## ⏳ Next Steps (TODO)

- [ ] Move `pages/` contents to `frontend/public/`
- [ ] Update file paths in HTML files
- [ ] Add database integration (replace User.js)
- [ ] Add input validation
- [ ] Implement rate limiting
- [ ] Add logout button to pages
- [ ] Basic error logging
- [ ] Production security checklist

## 📊 Project Status

```
✅ Backend Structure     - Complete
✅ Frontend Utils        - Complete
✅ Authentication       - Working
✅ API Endpoints        - 6 endpoints tested
⏳ Database Integration - Not started
⏳ Additional Pages     - Using old structure
⏳ Validation           - Not implemented
⏳ Error Logging        - Not implemented
```

## 📚 File Overview

### Backend Architecture
- **MVC Pattern**: Controllers separate from routes
- **Middleware**: Centralized JWT verification
- **Config**: Environment-based configuration
- **Modular**: Easy to scale and maintain

### Frontend Integration
- **Auth API**: Reusable class for all pages
- **Utilities**: Common functions
- **Login Handler**: Encapsulated in class

## 🔐 Security Notes

Current (Development):
- JWT tokens in localStorage
- Mock database
- Hardcoded credentials

For Production:
- [ ] Change JWT_SECRET in .env
- [ ] Use HTTPS
- [ ] Use secure HTTP-only cookies for tokens
- [ ] Add input validation
- [ ] Implement rate limiting
- [ ] Use real database with encryption
- [ ] Add comprehensive error logging

## 💡 Pro Tips

1. **Backend changes** - Don't need to reload frontend
2. **Frontend changes** - Refresh browser to see updates
3. **Token debugging** - Check localStorage in DevTools
4. **API testing** - Use Postman or browser DevTools Network tab
5. **Adding features** - Always follow MVC pattern

## 🎓 Learning Path

1. Read [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
2. Understand module separation
3. Read [backend/DEVELOPER_GUIDE.md](backend/DEVELOPER_GUIDE.md)
4. Try adding a new route
5. Read [FRONTEND_DEVELOPER_GUIDE.md](FRONTEND_DEVELOPER_GUIDE.md)
6. Try fetching data from new endpoint

---

**Status**: ✅ Professional project structure complete and working
**Backend**: ✅ Running on http://localhost:5000
**Frontend**: ✅ Ready for integration
