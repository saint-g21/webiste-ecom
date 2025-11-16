const API_BASE_URL = 'http://localhost:5000/api';

class AuthService {
    // Store token in localStorage
    static setToken(token) {
        localStorage.setItem('token', token);
    }

    // Get token from localStorage
    static getToken() {
        return localStorage.getItem('token');
    }

    // Remove token (logout)
    static removeToken() {
        localStorage.removeItem('token');
    }

    // Check if user is logged in
    static isLoggedIn() {
        return !!this.getToken();
    }

    // Make authenticated API requests
    static async makeRequest(url, options = {}) {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        // Add token if available
        const token = this.getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            console.log(`Making request to: ${url}`);
            const response = await fetch(url, config);
            
            // Check if response is OK
            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP Error: ${response.status}`, errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { message: `HTTP ${response.status}: ${response.statusText}` };
                }
                
                throw new Error(errorData.message || 'Request failed');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            
            // More specific error messages
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Cannot connect to server. Please check if backend is running.');
            }
            
            throw error;
        }
    }

    // Test backend connection
    static async testConnection() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return response.ok;
        } catch (error) {
            console.error('Backend connection test failed:', error);
            return false;
        }
    }
        // Register user
    static async register(userData) {
        return await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    // Login user
    static async login(credentials) {
        const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify(credentials)
        });

        if (response.success && response.data.token) {
            this.setToken(response.data.token);
        }

        return response;
    }

    // Get current user
    static async getCurrentUser() {
        return await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/me`);
    }

    // Update profile
    static async updateProfile(profileData) {
        return await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/profile`, {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    // Logout
    static logout() {
        this.removeToken();
        window.location.href = '/frontend/access/login.html';
    }
}

// Add connection test on page load
document.addEventListener('DOMContentLoaded', async function() {
    const isBackendConnected = await AuthService.testConnection();
    
    if (!isBackendConnected) {
        const messageDiv = document.getElementById('message');
        if (messageDiv) {
            messageDiv.innerHTML = `
                <div style="background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>Backend Connection Issue:</strong> Cannot connect to server. 
                    Please ensure the backend is running on port 5000.
                    <br><small>Run: <code>cd backend && npm start</code></small>
                </div>
            `;
        }
    }
});


// Usage in your login form:
async function handleLogin(event) {
    event.preventDefault();
    
    const credentials = {
        username: document.getElementById('username').value,
        password: document.getElementById('password').value
    };

    try {
        const result = await AuthService.login(credentials);
        
        if (result.success) {
            // Redirect to home
            window.location.href = '/home/home.html';
        } else {
            // Show error message
            alert(result.message);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}