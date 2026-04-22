# Frontend Setup

## Using the Auth System

### 1. Login Page
The `login.html` is already configured to:
- Accept email and password
- Send credentials to backend
- Store authentication token in localStorage
- Redirect to dashboard on success
- Handle errors gracefully

### 2. Protecting Other Pages

To protect pages and prevent unauthorized access, add this to any page (e.g., dashboard.html):

```html
<script>
  // Redirect to login if not authenticated
  if (!localStorage.getItem('authToken')) {
    window.location.href = 'login.html';
  }
  
  // Get user info
  const user = JSON.parse(localStorage.getItem('user'));
  console.log('Welcome,', user.name);
</script>
```

### 3. Making Authenticated API Calls

Include the auth-api.js utility:

```html
<script src="auth-api.js"></script>
<script>
  // Get dashboard stats
  (async () => {
    const { data } = await authAPI.get('/dashboard/stats');
    console.log(data);
  })();
  
  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await authAPI.logout();
    window.location.href = 'login.html';
  });
</script>
```

### 4. Token Management

- **Token stored in:** `localStorage.authToken`
- **User info stored in:** `localStorage.user` (as JSON)
- **Token expires after:** 8 hours
- **Auto-refresh:** Add token refresh endpoint in backend if needed

## Important Notes

⚠️ **Security Considerations:**
- Tokens stored in localStorage are accessible to XSS attacks
- In production, use secure HTTP-only cookies for tokens
- Change JWT_SECRET in backend .env file
- Never commit .env files to git (already in .gitignore)
- Use HTTPS in production
 
