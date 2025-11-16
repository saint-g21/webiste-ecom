// Profile Page JavaScript
const API_BASE_URL = 'http://localhost:5000/api';

// DOM elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const editPersonalBtn = document.getElementById('editPersonalBtn');
const personalForm = document.getElementById('personalForm');
const personalFormActions = document.getElementById('personalFormActions');
const cancelPersonalBtn = document.getElementById('cancelPersonalBtn');
const addAddressBtn = document.getElementById('addAddressBtn');
const userAvatar = document.getElementById('userAvatar');
const userName = document.getElementById('userName');
const userEmail = document.getElementById('userEmail');
const userJoinDate = document.getElementById('userJoinDate');

// Debug: Check what's available
console.log('Profile script loaded');
console.log('AuthService available:', typeof AuthService !== 'undefined');
console.log('DOM elements found:', {
    tabBtns: tabBtns.length,
    tabContents: tabContents.length,
    editPersonalBtn: !!editPersonalBtn,
    personalForm: !!personalForm
});

// TEMPORARY FIX: Sync token keys
if (localStorage.getItem('token') && !localStorage.getItem('userToken')) {
    console.log('Fixing token key mismatch...');
    const token = localStorage.getItem('token');
    localStorage.setItem('userToken', token);
    console.log('Token copied from "token" to "userToken"');
}

// Also ensure userData exists
if (!localStorage.getItem('userData') && localStorage.getItem('token')) {
    console.log('Creating default user data...');
    const defaultUser = {
        fullName: 'Demo User',
        email: 'user@example.com',
        username: 'demo',
        phone: '+1234567890',
        birthDate: '1990-01-01',
        createdAt: new Date().toISOString()
    };
    localStorage.setItem('userData', JSON.stringify(defaultUser));
}

// Enhanced AuthService Fallback
if (typeof AuthService === 'undefined') {
    console.log('Creating enhanced AuthService fallback');
    
    // Delete account function
    async function deleteAccount() {
        try {
            const response = await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/delete-account`, {
                method: 'DELETE'
            });
            
            if (response.success) {
                this.logout(); // Clean up and redirect
            }
            
            return response;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
    
    window.AuthService = {
        isLoggedIn: function() {
            const token = localStorage.getItem('userToken') || localStorage.getItem('token');
            const userData = localStorage.getItem('userData');
            console.log('AuthService.isLoggedIn check:', { token: !!token, userData: !!userData });
            return !!token;
        },
        
        getCurrentUser: async function() {
            try {
                const token = localStorage.getItem('userToken') || localStorage.getItem('token');
                const userData = localStorage.getItem('userData');
                
                console.log('Getting current user:', { token: !!token, userData: !!userData });
                
                if (!token) {
                    return { success: false, message: 'Not authenticated' };
                }
                
                if (userData) {
                    const user = JSON.parse(userData);
                    console.log('Returning user from localStorage:', user);
                    return { 
                        success: true, 
                        data: { user } 
                    };
                }
                
                // Return mock data if no localStorage data
                const mockUser = {
                    fullName: 'Demo User',
                    email: 'demo@example.com',
                    username: 'demouser',
                    phone: '+1234567890',
                    birthDate: '1990-01-01',
                    createdAt: new Date().toISOString()
                };
                
                console.log('Returning mock user data');
                return {
                    success: true,
                    data: { user: mockUser }
                };
                
            } catch (error) {
                console.error('Error in getCurrentUser:', error);
                return { success: false, message: error.message };
            }
        },

        // Two-factor methods
        enableTwoFactor: async function() {
            return await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/enable-2fa`, {
                method: 'POST'
            });
        },

        disableTwoFactor: async function() {
            return await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/disable-2fa`, {
                method: 'POST'
            });
        },

        verifyTwoFactor: async function(code) {
            return await this.makeAuthenticatedRequest(`${API_BASE_URL}/auth/verify-2fa`, {
                method: 'POST',
                body: JSON.stringify({ code })
            });
        },

        makeAuthenticatedRequest: async function(url, options = {}) {
            console.log('Making authenticated request to:', url);
            const token = localStorage.getItem('userToken');
            
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                },
                ...options
            };
            
            if (config.body && typeof config.body === 'object') {
                config.body = JSON.stringify(config.body);
            }
            
            try {
                const response = await fetch(url, config);
                const data = await response.json();
                console.log('API response:', data);
                return data;
            } catch (error) {
                console.error('API request failed:', error);
                return { success: false, message: error.message };
            }
        },
        
        updateProfile: async function(profileData) {
            console.log('Updating profile:', profileData);
            
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Update localStorage
            const userData = localStorage.getItem('userData');
            if (userData) {
                const user = JSON.parse(userData);
                const updatedUser = { ...user, ...profileData };
                localStorage.setItem('userData', JSON.stringify(updatedUser));
            }
            
            return { success: true, message: 'Profile updated successfully' };
        },
        
        deleteAccount: deleteAccount,
        
        logout: function() {
            console.log('Logging out user');
            localStorage.removeItem('userToken');
            localStorage.removeItem('userData');
            localStorage.removeItem('token');
            window.location.href = '/frontend/access/login.html';
        }
    };
    
    console.log('Enhanced AuthService fallback initialized');
}

// Single DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded, initializing profile...');
    initializeProfile();
});

async function initializeProfile() {
    try {
        console.log('Starting profile initialization...');
        
        // Check authentication
        const isLoggedIn = AuthService.isLoggedIn();
        console.log('User logged in:', isLoggedIn);
        
        if (!isLoggedIn) {
            console.log('User not authenticated, redirecting to login');
            showNotification('Please login to access your profile', 'error');
            setTimeout(() => {
                window.location.href = '/frontend/access/login.html';
            }, 2000);
            return;
        }
        
        console.log('User is authenticated, setting up UI...');
        
        // Set up UI components
        setupTabs();
        setupFormEditing();
        setupAddressManagement();
        setupAccountManagement();
        setupTwoFactorAuth();
        setupLogout();
        
        // Load data
        await loadUserData();
        await loadUserAddresses();
        
        console.log('Profile page fully initialized and ready');
        
    } catch (error) {
        console.error('Failed to initialize profile page:', error);
        showNotification('Profile loading failed. Some features may not work.', 'error');
        
        // Try to set up basic UI anyway
        setupTabs();
        setupFormEditing();
        setupAddressManagement();
        setupAccountManagement();
        setupLogout();
        loadMockData();
    }
}

function loadMockData() {
    console.log('Loading mock data for demonstration');
    
    const mockUser = {
        fullName: 'Demo User',
        email: 'demo@example.com',
        username: 'demouser',
        phone: '+1234567890',
        birthDate: '1990-01-01',
        createdAt: new Date().toISOString()
    };
    
    updateUIWithUserData(mockUser);
    
    const mockAddresses = [
        {
            id: 1,
            type: 'Home',
            street: '123 Main Street',
            city: 'San Francisco',
            state: 'CA',
            zipCode: '94105',
            country: 'United States',
            isDefault: true
        }
    ];
    
    renderAddresses(mockAddresses);
}

async function loadUserData() {
    console.log('Loading user data...');
    
    try {
        const response = await AuthService.getCurrentUser();
        console.log('User data response:', response);
        
        if (response && response.success) {
            const user = response.data.user;
            console.log('User data loaded:', user);
            updateUIWithUserData(user);
        } else {
            console.error('Failed to load user data:', response);
            showNotification(response?.message || 'Failed to load profile data', 'error');
            loadMockData(); // Fallback to mock data
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        showNotification('Failed to load profile data', 'error');
        loadMockData(); // Fallback to mock data
    }
}

function updateUIWithUserData(user) {
    console.log('Updating UI with user data:', user);
    
    if (userName) userName.textContent = user.fullName || user.name || 'User';
    if (userEmail) userEmail.textContent = user.email || 'No email provided';
    if (userJoinDate) {
        const joinDate = new Date(user.createdAt || Date.now()).toLocaleDateString();
        userJoinDate.textContent = `Member since ${joinDate}`;
    }
    if (userAvatar) {
        const initials = user.fullName ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U';
        userAvatar.textContent = initials;
    }
    if (phoneInput) phoneInput.value = user.phone || '';
    if (birthDateInput) birthDateInput.value = user.birthDate || '';
    
    updateFormFields(user);
}

function updateFormFields(user) {
    const fields = {
        'fullName': user.fullName,
        'email': user.email,
        'username': user.username,
        'phone': user.phone,
        'birthDate': user.birthDate
    };
    
    for (const [fieldId, value] of Object.entries(fields)) {
        const element = document.getElementById(fieldId);
        if (element) {
            element.value = value || '';
        }
    }
}

function setupTabs() {
    console.log('Setting up tabs with', tabBtns.length, 'tabs');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabId);
            
            // Remove active class from all tabs and contents
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to current tab and content
            this.classList.add('active');
            const targetTab = document.getElementById(tabId + '-tab');
            if (targetTab) {
                targetTab.classList.add('active');
            } else {
                console.error('Tab content not found:', tabId + '-tab');
            }
        });
    });
    
    // Activate first tab by default
    if (tabBtns.length > 0 && !document.querySelector('.tab-btn.active')) {
        tabBtns[0].click();
    }
}

function setupFormEditing() {
    console.log('Setting up form editing');
    
    if (!editPersonalBtn) {
        console.error('Edit personal button not found');
        return;
    }
    
    editPersonalBtn.addEventListener('click', function() {
        console.log('Edit button clicked');
        enableFormEditing();
    });
    
    if (cancelPersonalBtn) {
        cancelPersonalBtn.addEventListener('click', function() {
            disableFormEditing();
            loadUserData(); // Reload original data
        });
    }
    
    if (personalForm) {
        personalForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await saveProfileChanges();
        });
    }
}

function enableFormEditing() {
    const formInputs = personalForm.querySelectorAll('input');
    formInputs.forEach(input => {
        input.removeAttribute('readonly');
        input.style.backgroundColor = 'white';
        input.style.borderColor = '#6B9FFF';
    });
    
    personalFormActions.style.display = 'flex';
    editPersonalBtn.style.display = 'none';
}

function disableFormEditing() {
    const formInputs = personalForm.querySelectorAll('input');
    formInputs.forEach(input => {
        input.setAttribute('readonly', 'true');
        input.style.backgroundColor = '#f8f9fa';
        input.style.borderColor = '#e1e4eb';
    });
    
    personalFormActions.style.display = 'none';
    editPersonalBtn.style.display = 'block';
}

async function saveProfileChanges() {
    try {
        const formData = new FormData(personalForm);
        const profileData = {
            fullName: formData.get('fullName'),
            email: formData.get('email')
        };
        
        const response = await AuthService.updateProfile(profileData);
        
        if (response.success) {
            showNotification('Profile updated successfully!', 'success');
            disableFormEditing();
            loadUserData();
        } else {
            showNotification(response.message || 'Failed to update profile', 'error');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showNotification('Failed to update profile', 'error');
    }
}

function setupAddressManagement() {
    if (!addAddressBtn) {
        console.log('Add address button not found');
        return;
    }
    
    addAddressBtn.addEventListener('click', function() {
        console.log('Add address button clicked');
        openAddAddressModal();
    });
}

async function loadUserAddresses() {
    console.log('Loading user addresses...');
    
    try {
        // For now, use mock data
        const mockAddresses = [
            {
                id: 1,
                type: 'Home',
                street: '123 Main Street',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94105',
                country: 'United States',
                isDefault: true
            },
            {
                id: 2,
                type: 'Work',
                street: '456 Market Street',
                city: 'San Francisco',
                state: 'CA',
                zipCode: '94103',
                country: 'United States',
                isDefault: false
            }
        ];
        
        renderAddresses(mockAddresses);
    } catch (error) {
        console.error('Error loading addresses:', error);
    }
}

function renderAddresses(addresses) {
    const addressesContainer = document.getElementById('addressesContainer');
    if (!addressesContainer) {
        console.error('Addresses container not found');
        return;
    }
    
    addressesContainer.innerHTML = '';
    
    if (addresses.length === 0) {
        addressesContainer.innerHTML = '<div class="no-addresses">No addresses saved yet</div>';
        return;
    }
    
    addresses.forEach(address => {
        const addressCard = createAddressCard(address);
        addressesContainer.appendChild(addressCard);
    });
}

function createAddressCard(address) {
    const addressCard = document.createElement('div');
    addressCard.className = 'address-card';
    addressCard.innerHTML = `
        <div class="address-header">
            <h4>${address.type}</h4>
            ${address.isDefault ? '<span class="default-badge">Default</span>' : ''}
        </div>
        <div class="address-details">
            <p>${address.street}</p>
            <p>${address.city}, ${address.state} ${address.zipCode}</p>
            <p>${address.country}</p>
        </div>
        <div class="address-actions">
            <button class="btn-text set-default-btn" data-address-id="${address.id}">
                ${!address.isDefault ? 'Set as Default' : 'Default Address'}
            </button>
            <button class="btn-text delete-address-btn" data-address-id="${address.id}">Delete</button>
        </div>
    `;
    
    return addressCard;
}

function openAddAddressModal() {
    console.log('Opening add address modal');
    // Create modal HTML
    const modalHTML = `
        <div class="modal-overlay" id="addressModalOverlay">
            <div class="modal" id="addressModal">
                <div class="modal-header">
                    <h3>Add New Address</h3>
                    <button class="close-modal" id="closeAddressModal">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="addAddressForm">
                        <div class="form-group">
                            <label for="addressType">Address Type</label>
                            <select id="addressType" required>
                                <option value="Home">Home</option>
                                <option value="Work">Work</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="street">Street Address</label>
                            <input type="text" id="street" required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="city">City</label>
                                <input type="text" id="city" required>
                            </div>
                            <div class="form-group">
                                <label for="state">State</label>
                                <input type="text" id="state" required>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="zipCode">ZIP Code</label>
                                <input type="text" id="zipCode" required>
                            </div>
                            <div class="form-group">
                                <label for="country">Country</label>
                                <input type="text" id="country" value="United States" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="setAsDefault">
                                Set as default address
                            </label>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelAddress">Cancel</button>
                    <button type="submit" form="addAddressForm" class="btn-primary">Save Address</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Set up modal event listeners
    setupAddressModal();
}

function setupAddressModal() {
    const overlay = document.getElementById('addressModalOverlay');
    const closeBtn = document.getElementById('closeAddressModal');
    const cancelBtn = document.getElementById('cancelAddress');
    const form = document.getElementById('addAddressForm');
    
    function closeModal() {
        overlay.remove();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
    });
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await saveNewAddress();
    });
}

async function saveNewAddress() {
    try {
        const addressData = {
            type: document.getElementById('addressType').value,
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value,
            isDefault: document.getElementById('setAsDefault').checked
        };
        
        // API call to save address
        await AuthService.makeAuthenticatedRequest(`${API_BASE_URL}/addresses`, {
            method: 'POST',
            body: JSON.stringify(addressData)
        });

        showNotification('Address added successfully!', 'success');
        document.getElementById('addressModalOverlay').remove();
        loadUserAddresses(); // Reload addresses
    } catch (error) {
        console.error('Error saving address:', error);
        showNotification('Failed to add address', 'error');
    }
}

// Account Management Functions
function setupAccountManagement() {
    const deleteAccountBtn = document.getElementById('deleteAccountBtn');
    
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', function() {
            openDeleteAccountModal();
        });
    }
}

function openDeleteAccountModal() {
    const modalHTML = `
        <div class="modal-overlay" id="deleteAccountModal">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h3 style="color: #ef4444;">Delete Account</h3>
                    <button class="close-modal" id="closeDeleteModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="warning-message" style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                        <i class="fas fa-exclamation-triangle" style="color: #ef4444; margin-right: 10px;"></i>
                        <strong>This action cannot be undone!</strong>
                    </div>
                    <p>Are you sure you want to delete your account? This will:</p>
                    <ul style="color: #6b7280; margin: 15px 0; padding-left: 20px;">
                        <li>Permanently delete your profile data</li>
                        <li>Remove all your saved addresses</li>
                        <li>Cancel any pending orders</li>
                        <li>Delete your cart items</li>
                    </ul>
                    <div class="form-group">
                        <label for="confirmPassword">Enter your password to confirm:</label>
                        <input type="password" id="confirmPassword" placeholder="Your password" required>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancelDelete">Cancel</button>
                    <button type="button" class="btn-danger" id="confirmDelete">Delete Account</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupDeleteModal();
}

function setupDeleteModal() {
    const modal = document.getElementById('deleteAccountModal');
    const closeBtn = document.getElementById('closeDeleteModal');
    const cancelBtn = document.getElementById('cancelDelete');
    const confirmBtn = document.getElementById('confirmDelete');
    
    function closeModal() {
        modal.remove();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    confirmBtn.addEventListener('click', async function() {
        const password = document.getElementById('confirmPassword').value;
        
        if (!password) {
            showNotification('Please enter your password to confirm', 'error');
            return;
        }
        
        try {
            // For demo purposes, we'll just delete the account
            const deleteResponse = await AuthService.deleteAccount();
            
            if (deleteResponse.success) {
                showNotification('Account deleted successfully', 'success');
                closeModal();
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            showNotification('Failed to delete account', 'error');
        }
    });
}

// Two-Factor Authentication Functions
function setupTwoFactorAuth() {
    const twoFactorToggle = document.getElementById('twoFactorToggle');
    const setup2FABtn = document.getElementById('setup2FABtn');
    
    if (twoFactorToggle) {
        twoFactorToggle.addEventListener('change', function() {
            if (this.checked) {
                openTwoFactorSetupModal();
            } else {
                disableTwoFactor();
            }
        });
    }
    
    if (setup2FABtn) {
        setup2FABtn.addEventListener('click', openTwoFactorSetupModal);
    }
}

function openTwoFactorSetupModal() {
    const modalHTML = `
        <div class="modal-overlay" id="twoFactorModal">
            <div class="modal" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>Set Up Two-Factor Authentication</h3>
                    <button class="close-modal" id="close2FAModal">&times;</button>
                </div>
                <div class="modal-body">
                    <div id="2faSetupStep1">
                        <p>Scan the QR code with your authenticator app:</p>
                        <div id="qrcodeContainer" style="text-align: center; margin: 20px 0;">
                            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; display: inline-block;">
                                <p>QR Code would appear here in a real implementation</p>
                            </div>
                        </div>
                        <p style="font-size: 14px; color: #6b7280;">
                            Manual setup code: <code id="manualCode" style="background: #f3f4f6; padding: 5px; border-radius: 4px;">DEMO-2FA-CODE</code>
                        </p>
                    </div>
                    <div id="2faSetupStep2" style="display: none;">
                        <div class="form-group">
                            <label for="verificationCode">Enter verification code:</label>
                            <input type="text" id="verificationCode" placeholder="000000" maxlength="6" pattern="[0-9]{6}" required>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" id="cancel2FA">Cancel</button>
                    <button type="button" class="btn-primary" id="next2FAStep">Next</button>
                    <button type="button" class="btn-primary" id="enable2FA" style="display: none;">Enable 2FA</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    setupTwoFactorModal();
}

function setupTwoFactorModal() {
    const modal = document.getElementById('twoFactorModal');
    const closeBtn = document.getElementById('close2FAModal');
    const cancelBtn = document.getElementById('cancel2FA');
    const nextBtn = document.getElementById('next2FAStep');
    const enableBtn = document.getElementById('enable2FA');
    
    nextBtn.addEventListener('click', function() {
        document.getElementById('2faSetupStep1').style.display = 'none';
        document.getElementById('2faSetupStep2').style.display = 'block';
        nextBtn.style.display = 'none';
        enableBtn.style.display = 'block';
    });
    
    enableBtn.addEventListener('click', async function() {
        const code = document.getElementById('verificationCode').value;
        
        if (!code || code.length !== 6) {
            showNotification('Please enter a valid 6-digit code', 'error');
            return;
        }
        
        try {
            const response = await AuthService.verifyTwoFactor(code);
            
            if (response.success) {
                showNotification('Two-factor authentication enabled successfully!', 'success');
                modal.remove();
                update2FAStatus(true);
            } else {
                showNotification('Invalid verification code', 'error');
            }
        } catch (error) {
            console.error('Error enabling 2FA:', error);
            showNotification('Failed to enable two-factor authentication', 'error');
        }
    });
    
    function closeModal() {
        modal.remove();
    }
    
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
}

async function disableTwoFactor() {
    try {
        const response = await AuthService.disableTwoFactor();
        
        if (response.success) {
            showNotification('Two-factor authentication disabled', 'success');
            update2FAStatus(false);
        }
    } catch (error) {
        console.error('Error disabling 2FA:', error);
        showNotification('Failed to disable two-factor authentication', 'error');
    }
}

function update2FAStatus(enabled) {
    const toggle = document.getElementById('twoFactorToggle');
    const statusText = document.getElementById('2faStatus');
    
    if (toggle) toggle.checked = enabled;
    if (statusText) statusText.textContent = enabled ? 'Enabled' : 'Disabled';
}

// Logout Functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            performLogout();
        });
    }
    
    // Also add logout to navigation if needed
    const navLogoutBtns = document.querySelectorAll('.logout-nav');
    navLogoutBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            performLogout();
        });
    });
}

async function performLogout() {
    try {
        showNotification('Logging out...', 'info');
        await AuthService.logout();
    } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        localStorage.removeItem('userToken');
        localStorage.removeItem('token');
        localStorage.removeItem('userData');
        window.location.href = '/frontend/access/login.html';
    }
}

// Notification function
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1001;
        animation: slideIn 0.3s ease;
    `;
    
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}