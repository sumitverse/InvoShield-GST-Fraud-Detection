class LoginHandler {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.rememberCheckbox = document.getElementById('remember');
    this.loginBtn = document.getElementById('loginBtn');
    
    this.API_URL = 'http://localhost:5000/api';
    this.init();
  }

  init() {
    this.loadSavedEmail();
    this.form?.addEventListener('submit', (e) => this.handleLogin(e));
    document.getElementById('eyeBtn')?.addEventListener('click', () => this.togglePassword());
  }

  loadSavedEmail() {
    const savedEmail = localStorage.getItem('rememberEmail');
    if (savedEmail) {
      this.emailInput.value = savedEmail;
      this.rememberCheckbox.checked = true;
    }
  }

  togglePassword() {
    const isPassword = this.passwordInput.type === 'password';
    this.passwordInput.type = isPassword ? 'text' : 'password';
    
    const icon = document.getElementById('eyeIcon');
    if (icon) {
      icon.innerHTML = isPassword 
        ? `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>`
        : `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;
    
    if (!email || !password) {
      this.showError('Please enter both email and password');
      return;
    }

    this.setLoading(true);

    try {
      const response = await fetch(`${this.API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        this.showError(data.message || 'Login failed');
        this.setLoading(false);
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (this.rememberCheckbox.checked) {
        localStorage.setItem('rememberEmail', email);
      } else {
        localStorage.removeItem('rememberEmail');
      }

      this.loginBtn.textContent = '✓ Access Granted';
      this.loginBtn.style.background = 'linear-gradient(135deg, #0c9e4a, #39ff8c)';
      
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      this.showError('Network error. Please check if the server is running.');
      this.setLoading(false);
    }
  }

  showError(message) {
    const existingError = this.form.querySelector('.error-message');
    if (existingError) existingError.remove();

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.cssText = 'background-color: #ff6b6b; color: white; padding: 10px 15px; border-radius: 6px; margin-bottom: 15px; font-size: 14px;';
    errorDiv.textContent = message;
    this.form.insertBefore(errorDiv, this.form.firstChild);
  }

  setLoading(loading) {
    this.loginBtn.disabled = loading;
    this.loginBtn.style.opacity = loading ? '0.75' : '1';
    this.loginBtn.textContent = loading ? 'Authenticating...' : 'Sign In to Dashboard';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new LoginHandler();
});
