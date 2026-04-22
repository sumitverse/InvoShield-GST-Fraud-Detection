# Backend Setup & Running Instructions

## Prerequisites
- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:5000`

## Default Login Credentials
- **Email:** `officer@gst.gov.in`
- **Password:** `test123`

## API Endpoints

### 1. Login Endpoint
**POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "officer@gst.gov.in",
    "password": "test123"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "email": "officer@gst.gov.in",
      "name": "GST Officer",
      "gstin": "27AABC1234D1Z5"
    }
  }
  ```

### 2. Dashboard Stats (Protected)
**GET** `/api/dashboard/stats`
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
  ```json
  {
    "success": true,
    "user": {...},
    "stats": {...}
  }
  ```

### 3. Logout
**POST** `/api/auth/logout`

### 4. Health Check
**GET** `/api/health`

## Environment Variables (.env)
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)

## Connecting Frontend to Backend

The login page automatically connects to `http://localhost:5000/api`

**⚠️ Important:** If you change the backend URL, update the `API_URL` variable in `pages/login.html`

## Troubleshooting

1. **"Cannot find module" error:**
   - Run `npm install` again

2. **Port already in use:**
   - Change PORT in `.env` file
   - Or kill the process using port 5000

3. **CORS errors:**
   - Make sure frontend is running on localhost or allowed origin
   - Backend automatically allows localhost:3000, 127.0.0.1:3000, and file:// protocol

4. **Token issues:**
   - Tokens expire after 8 hours
   - Clear browser localStorage and login again if needed
