# Frontend Developer Guide

## File Structure

```
frontend/
├── js/
│   ├── auth-api.js        # API client class
│   ├── login.js           # Login page logic
│   └── utils.js           # Common utilities
├── css/                   # Stylesheets
├── assets/                # Images, icons
└── public/                # Static files (move pages/ here)
```

## Using Auth API

### Basic Setup

Include in your HTML:
```html
<script src="../frontend/js/auth-api.js"></script>
<script src="../frontend/js/utils.js"></script>
```

### Making API Calls

```javascript
// Check if logged in
if (!authAPI.isLoggedIn()) {
  window.location.href = 'login.html';
}

// GET request
const { status, data } = await authAPI.get('/dashboard/stats');
console.log(data.stats);

// POST request
const { status, data } = await authAPI.post('/invoices/scan', {
  invoiceId: 123
});

// Get user info
const user = authAPI.getUser();
console.log(user.email);

// Logout
await authAPI.logout();
```

## Common Utility Functions

```javascript
// Check authentication
if (!isAuthenticated()) {
  window.location.href = 'login.html';
}

// Get user info
const user = getUser();

// Format currency (Indian format)
const amount = formatCurrency(4800000);  // ₹4,800,000.00

// Format date/time
const date = formatDateTime(new Date());

// Show notifications
showToast('Login successful!', 'success');
showToast('Error occurred', 'error');
```

## Building Dashboard Page

```html
<!DOCTYPE html>
<html>
<head>
  <title>Dashboard</title>
  <link rel="stylesheet" href="dashboard.css">
</head>
<body>
  <!-- Your dashboard HTML -->
  
  <script src="../frontend/js/auth-api.js"></script>
  <script src="../frontend/js/utils.js"></script>
  <script>
    // Protect page
    if (!authAPI.isLoggedIn()) {
      window.location.href = 'login.html';
    }

    // Load data
    async function loadDashboard() {
      const { data } = await authAPI.get('/dashboard/stats');
      
      // Update UI with data
      document.getElementById('fraud-prevented').textContent = data.stats.fraudPrevented;
      document.getElementById('accuracy').textContent = data.stats.accuracy;
    }

    // Load on page load
    loadDashboard();

    // Logout handler
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      await authAPI.logout();
      window.location.href = 'login.html';
    });
  </script>
</body>
</html>
```

## Login Page Customization

The login page uses the `LoginHandler` class defined in `login.js`.

The form automatically:
- Validates inputs
- Calls backend API
- Stores tokens
- Redirects on success
- Shows errors

No additional code needed in HTML!

## Error Handling

```javascript
try {
  const { status, data } = await authAPI.get('/some-endpoint');
  
  if (!data.success) {
    console.error(data.message);
    showToast(data.message, 'error');
  }
} catch (error) {
  console.error('API error:', error);
  showToast('Network error', 'error');
}
```

## Token Management

Tokens are automatically:
- Stored in `localStorage.authToken`
- Added to every API request
- Validated by backend
- Checked for expiry

**Note:** For production, consider using secure HTTP-only cookies instead of localStorage.

## Adding New Pages

1. Create HTML file in `frontend/public/`
2. Add protection check at top:
   ```javascript
   <script>
     if (!localStorage.getItem('authToken')) {
       window.location.href = 'login.html';
     }
   </script>
   ```
3. Include auth scripts:
   ```html
   <script src="../frontend/js/auth-api.js"></script>
   <script src="../frontend/js/utils.js"></script>
   ```

## Development  Tips

- Use browser DevTools Network tab to debug API calls
- Check localStorage for stored token and user info
- Use `authAPI.getToken()` to see current token
- Token expires after 8 hours (can be changed in backend)
- Always handle errors gracefully

## Production Notes

- Update API_URL in auth-api.js for production backend
- Never commit tokens to git
- Use HTTPS for all communications
- Implement token refresh endpoint in backend
- Add loading states to prevent multiple submissions
