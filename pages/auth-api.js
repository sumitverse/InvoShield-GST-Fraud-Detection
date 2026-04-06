// API utility for authenticated requests
// Include this file in your other frontend pages

class AuthAPI {
  constructor(baseURL = 'http://localhost:5000/api') {
    this.baseURL = baseURL;
  }

  // Get stored token
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Get stored user info
  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getToken();
  }

  // Make authenticated request
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    // If unauthorized, redirect to login
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    }

    return { status: response.status, data };
  }

  // GET request
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  // POST request
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  // Logout
  async logout() {
    await this.post('/auth/logout');
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

// Initialize and export
const authAPI = new AuthAPI();
