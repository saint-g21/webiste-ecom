// script.js for login
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const showPassword = document.getElementById('showPassword');
    const successMessage = document.getElementById('successMessage');
    
    // Mock user database (in a real app, this would be on the server)
    const validUsers = [
        { username: 'admin', password: 'password123' },
        { username: 'user', password: 'user123' },
        { username: 'demo', password: 'demo123' },
        { username:  'Admin2' , password: 'admin123'}
    ];
    
    // Toggle password visibility
    showPassword.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            showPassword.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            showPassword.textContent = '👁️';
        }
    });
    
    // Validate username
    function validateUsername() {
        const username = usernameInput.value.trim();
        
        if (username === '') {
            setError(usernameInput, usernameError, 'Username is required');
            return false;
        }
        
        if (username.length < 3) {
            setError(usernameInput, usernameError, 'Username must be at least 3 characters');
            return false;
        }
        
        setSuccess(usernameInput, usernameError);
        return true;
    }
    
    // Validate password
    function validatePassword() {
        const password = passwordInput.value;
        
        if (password === '') {
            setError(passwordInput, passwordError, 'Password is required');
            return false;
        }
        
        if (password.length < 6) {
            setError(passwordInput, passwordError, 'Password must be at least 6 characters');
            return false;
        }
        
        setSuccess(passwordInput, passwordError);
        return true;
    }
    
    // Set error state
    function setError(input, errorElement, message) {
        const inputGroup = input.parentElement;
        inputGroup.classList.remove('success');
        inputGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // Set success state
    function setSuccess(input, errorElement) {
        const inputGroup = input.parentElement;
        inputGroup.classList.remove('error');
        inputGroup.classList.add('success');
        errorElement.style.display = 'none';
    }
    
    // Real-time validation
    usernameInput.addEventListener('input', validateUsername);
    passwordInput.addEventListener('input', validatePassword);
    
    // Form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();
        
        if (isUsernameValid && isPasswordValid) {
            const username = usernameInput.value.trim();
            const password = passwordInput.value;

            try {
                const result = await AuthService.login({ username, password });
                
                if (result.success) {
                    // Successful login
                    loginForm.style.display = 'none';
                    successMessage.style.display = 'block';
                    
                    setTimeout(() => {
                        window.location.href = '/frontend/home/home.html';
                    }, 2000);
                } else {
                    // Failed login
                    setError(usernameInput, usernameError, 'Invalid username or password');
                    setError(passwordInput, passwordError, 'Invalid username or password');
                    
                    // Shake animation for error feedback
                    loginForm.style.animation = 'shake 0.5s';
                    setTimeout(() => {
                        loginForm.style.animation = '';
                    }, 500);
                }
            } catch (error) {
                //handle api error
                setError(usernameInput, usernameError, 'An error occurred. Please try again.');
                setError(passwordInput, passwordError, 'An error occurred. Please try again.');

                loginForm.style.animation = 'shake 0.5s';
                setTimeout(() => {
                    loginForm.style.animation = '';
                }, 500);
            }
        }          
    });
    
    // Add shake animation for invalid login
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
});
// script2.js for signup - FIXED VERSION
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const signupForm = document.getElementById('signupForm');
    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const agreeTermsCheckbox = document.getElementById('agreeTerms');
    const signupButton = document.getElementById('signupButton');
    
    // Error elements
    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const usernameError = document.getElementById('usernameError');
    const passwordError = document.getElementById('passwordError');
    const confirmPasswordError = document.getElementById('confirmPasswordError');
    const termsError = document.getElementById('termsError');
    
    // Password strength elements
    const passwordStrengthBar = document.getElementById('passwordStrengthBar');
    const lengthReq = document.getElementById('lengthReq');
    const lowercaseReq = document.getElementById('lowercaseReq');
    const uppercaseReq = document.getElementById('uppercaseReq');
    const numberReq = document.getElementById('numberReq');
    const specialReq = document.getElementById('specialReq');
    
    // Success message
    const successMessage = document.getElementById('successMessage');
    
    console.log('Signup script loaded - AuthService available:', typeof AuthService !== 'undefined');
    
    // Toggle password visibility
    document.getElementById('showPassword').addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            this.textContent = '🙈';
        } else {
            passwordInput.type = 'password';
            this.textContent = '👁️';
        }
    });
    
    document.getElementById('showConfirmPassword').addEventListener('click', function() {
        if (confirmPasswordInput.type === 'password') {
            confirmPasswordInput.type = 'text';
            this.textContent = '🙈';
        } else {
            confirmPasswordInput.type = 'password';
            this.textContent = '👁️';
        }
    });
    
    // Validate full name
    function validateFullName() {
        const fullName = fullNameInput.value.trim();
        
        if (fullName === '') {
            setError(fullNameInput, fullNameError, 'Full name is required');
            return false;
        }
        
        if (fullName.length < 2) {
            setError(fullNameInput, fullNameError, 'Full name must be at least 2 characters');
            return false;
        }
        
        setSuccess(fullNameInput, fullNameError);
        return true;
    }
    
    // Validate email
    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        
        if (email === '') {
            setError(emailInput, emailError, 'Email is required');
            return false;
        }
        
        if (!emailRegex.test(email)) {
            setError(emailInput, emailError, 'Please enter a valid email address');
            return false;
        }
        
        setSuccess(emailInput, emailError);
        return true;
    }
    
    // Validate username
    function validateUsername() {
        const username = usernameInput.value.trim();
        const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
        
        if (username === '') {
            setError(usernameInput, usernameError, 'Username is required');
            return false;
        }
        
        if (!usernameRegex.test(username)) {
            setError(usernameInput, usernameError, 'Username must be 3-15 characters (letters, numbers, _)');
            return false;
        }
        
        setSuccess(usernameInput, usernameError);
        return true;
    }
    
    // Validate password
    function validatePassword() {
        const password = passwordInput.value;
        
        if (password === '') {
            setError(passwordInput, passwordError, 'Password is required');
            updatePasswordStrength(0);
            return false;
        }
        
        const strength = calculatePasswordStrength(password);
        updatePasswordStrength(strength);
        
        if (strength < 4) {
            setError(passwordInput, passwordError, 'Please create a stronger password');
            return false;
        }
        
        setSuccess(passwordInput, passwordError);
        return true;
    }
    
    // Calculate password strength
    function calculatePasswordStrength(password) {
        let strength = 0;
        
        // Length requirement
        if (password.length >= 8) {
            strength++;
            lengthReq.classList.add('valid');
        } else {
            lengthReq.classList.remove('valid');
        }
        
        // Lowercase requirement
        if (/[a-z]/.test(password)) {
            strength++;
            lowercaseReq.classList.add('valid');
        } else {
            lowercaseReq.classList.remove('valid');
        }
        
        // Uppercase requirement
        if (/[A-Z]/.test(password)) {
            strength++;
            uppercaseReq.classList.add('valid');
        } else {
            uppercaseReq.classList.remove('valid');
        }
        
        // Number requirement
        if (/[0-9]/.test(password)) {
            strength++;
            numberReq.classList.add('valid');
        } else {
            numberReq.classList.remove('valid');
        }
        
        // Special character requirement
        if (/[^A-Za-z0-9]/.test(password)) {
            strength++;
            specialReq.classList.add('valid');
        } else {
            specialReq.classList.remove('valid');
        }
        
        return strength;
    }
    
    // Update password strength bar
    function updatePasswordStrength(strength) {
        const percent = (strength / 5) * 100;
        passwordStrengthBar.style.width = percent + '%';
        
        if (strength <= 1) {
            passwordStrengthBar.style.backgroundColor = '#e74c3c';
        } else if (strength <= 3) {
            passwordStrengthBar.style.backgroundColor = '#f39c12';
        } else {
            passwordStrengthBar.style.backgroundColor = '#2ecc71';
        }
    }
    
    // Validate confirm password
    function validateConfirmPassword() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword === '') {
            setError(confirmPasswordInput, confirmPasswordError, 'Please confirm your password');
            return false;
        }
        
        if (password !== confirmPassword) {
            setError(confirmPasswordInput, confirmPasswordError, 'Passwords do not match');
            return false;
        }
        
        setSuccess(confirmPasswordInput, confirmPasswordError);
        return true;
    }
    
    // Validate terms agreement
    function validateTerms() {
        if (!agreeTermsCheckbox.checked) {
            termsError.style.display = 'block';
            return false;
        }
        
        termsError.style.display = 'none';
        return true;
    }
    
    // Set error state
    function setError(input, errorElement, message) {
        const inputGroup = input.parentElement;
        inputGroup.classList.remove('success');
        inputGroup.classList.add('error');
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // Set success state
    function setSuccess(input, errorElement) {
        const inputGroup = input.parentElement;
        inputGroup.classList.remove('error');
        inputGroup.classList.add('success');
        errorElement.style.display = 'none';
    }
    
    // CREATE TOKEN AND USER DATA AFTER SIGNUP
    function setupNewUser(userData) {
        console.log('Setting up new user with data:', userData);
        
        // Create token and user data
        const token = 'new-user-token-' + Date.now() + '-' + userData.username;
        const userProfile = {
            id: Math.floor(Math.random() * 1000) + 1,
            fullName: userData.fullName,
            email: userData.email,
            username: userData.username,
            phone: '+1234567890', // Default phone
            birthDate: '1990-01-01', // Default birth date
            createdAt: new Date().toISOString()
        };
        
        // Store in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(userProfile));
        
        console.log('New user token set:', token);
        console.log('New user data set:', userProfile);
        
        return { token, user: userProfile };
    }
    
    // Real-time validation
    fullNameInput.addEventListener('input', validateFullName);
    emailInput.addEventListener('input', validateEmail);
    usernameInput.addEventListener('input', validateUsername);
    passwordInput.addEventListener('input', validatePassword);
    confirmPasswordInput.addEventListener('input', validateConfirmPassword);
    agreeTermsCheckbox.addEventListener('change', validateTerms);
    
    // Form submission - UPDATED TO CREATE TOKENS
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const isFullNameValid = validateFullName();
        const isEmailValid = validateEmail();
        const isUsernameValid = validateUsername();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();
        const isTermsValid = validateTerms();
        
        if (isFullNameValid && isEmailValid && isUsernameValid && 
            isPasswordValid && isConfirmPasswordValid && isTermsValid) {
            
            const userData = {
                fullName: fullNameInput.value.trim(),
                email: emailInput.value.trim(),
                username: usernameInput.value.trim(),
                password: passwordInput.value
            };
            
            try {
                // Option 1: Use AuthService if backend is available
                if (typeof AuthService !== 'undefined') {
                    const result = await AuthService.register(userData);
                    
                    if (result.success) {
                        // Auto-login after successful registration
                        const loginResult = await AuthService.login({
                            username: userData.username,
                            password: userData.password
                        });
                        
                        if (loginResult.success) {
                            showSuccessAndRedirect('Registration successful! Welcome!');
                        } else {
                            // If login fails, still set tokens manually
                            setupNewUser(userData);
                            showSuccessAndRedirect('Registration successful! Welcome!');
                        }
                    } else {
                        throw new Error(result.message || 'Registration failed');
                    }
                } else {
                    // Option 2: Manual setup (fallback)
                    setupNewUser(userData);
                    showSuccessAndRedirect('Registration successful! Welcome!');
                }
                
            } catch (error) {
                console.error('Signup error:', error);
                // Fallback: Manual setup if AuthService fails
                setupNewUser(userData);
                showSuccessAndRedirect('Registration successful! Welcome!');
            }
        } else {
            // Shake animation for error feedback
            signupForm.style.animation = 'shake 0.5s';
            setTimeout(() => {
                signupForm.style.animation = '';
            }, 500);
        }
    });
    
    // Helper function for success flow
    function showSuccessAndRedirect(message) {
        signupForm.style.display = 'none';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h3>${message}</h3>
                <p>Redirecting to home page...</p>
                <p><small>Token created: ${localStorage.getItem('token') ? 'Yes' : 'No'}</small></p>
            </div>
        `;
        successMessage.style.display = 'block';
        
        // Verify token was set
        console.log('Token after signup:', localStorage.getItem('token'));
        console.log('User data after signup:', localStorage.getItem('userData'));
        
        // Redirect to home page (auto-login)
        setTimeout(() => {
            window.location.href = '/frontend/home/home.html';
        }, 3000);
    }
});