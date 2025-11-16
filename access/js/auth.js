const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static removeToken() {
        localStorage.removeItem('token');
    }

    static setUserData(userData) {
        localStorage.setItem('userData', JSON.stringify(userData));
    }

    static getUserData() {
        const userData = localStorage.getItem('userData');
        return userData ? JSON.parse(userData) : null;
    }

    static removeUserData() {
        localStorage.removeItem('userData');
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    static async makeRequest(url, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add token to headers if available
        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    static async register(userData) {
        const response = await this.makeRequest(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        // If your API returns token immediately after registration
        if (response.success && response.data?.token) {
            this.setToken(response.data.token);
            if (response.data.user) {
                this.setUserData(response.data.user);
            }
        }

        return response;
    }

    static async login(credentials) {
        const response = await this.makeRequest(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
            
            // Set user data from server response
            if (response.data.user) {
                this.setUserData(response.data.user);
            } else {
                console.warn('No user data received from server');
                // Don't create default data - this should come from server
            }
        }

        return response;
    }

    static async getCurrentUser() {
        return await this.makeRequest(`${API_BASE_URL}/auth/me`);
    }

    static logout() {
        this.removeToken();
        this.removeUserData();
        window.location.href = 'login.html';
    }
}

// Login Form Handler
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const showPassword = document.getElementById('showPassword');
    const passwordInput = document.getElementById('password');

    showPassword?.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            showPassword.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            showPassword.textContent = '👁️';
        }
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const result = await AuthService.login({ username, password });
            
            if (result.success) {
                showMessage('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/frontend/home/home.html';
                }, 1500);
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Signup Form Handler
if (document.getElementById('signupForm')) {
    const signupForm = document.getElementById('signupForm');

    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userData = {
            fullName: document.getElementById('fullName').value,
            email: document.getElementById('email').value,
            username: document.getElementById('username').value,
            password: document.getElementById('password').value
        };
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (userData.password !== confirmPassword) {
            showMessage('Passwords do not match', 'error');
            return;
        }

        try {
            const result = await AuthService.register(userData);
            
            if (result.success) {
                if (AuthService.isLoggedIn()) {
                    // If auto-logged in after registration
                    showMessage('Registration successful! Redirecting...', 'success');
                    setTimeout(() => {
                        window.location.href = '/frontend/home/home.html';
                    }, 2000);
                } else {
                    // If need to login separately
                    showMessage('Registration successful! Please login.', 'success');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 2000);
                }
            }
        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
}

// Utility function to show messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = type;
        messageDiv.style.display = 'block';
        
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
    }
}

/* Check if user is already logged in 
if (AuthService.isLoggedIn() && !window.location.pathname.includes('/frontend/home/home.html')) {
    window.location.href = '/frontend/home/home.html';
}*/