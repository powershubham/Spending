// API Base URL - Updated for Render deployment
const API_BASE_URL = 'https://spending-h227.onrender.com/api/auth';

// DOM Elements
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const messageContainer = document.getElementById('messageContainer');

// Utility function to show messages
function showMessage(message, type = 'success') {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    messageContainer.appendChild(messageElement);

    // Remove message after 3 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 3000);
}

// Utility function to handle API responses
async function handleResponse(response) {
    if (!response.ok) {
        let errorMessage = 'An error occurred';
        
        try {
            const errorData = await response.json();
            
            // Handle different error response formats
            if (errorData.message) {
                errorMessage = errorData.message;
            } else if (errorData.error) {
                errorMessage = errorData.error;
            } else if (errorData.errors && Array.isArray(errorData.errors)) {
                // Handle validation errors array
                errorMessage = errorData.errors.map(err => err.message || err).join(', ');
            } else if (errorData.detail) {
                errorMessage = errorData.detail;
            } else if (response.status === 401) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (response.status === 400) {
                errorMessage = 'Invalid request. Please check your input.';
            } else {
                errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
        } catch (e) {
            // If response is not JSON, try to get text
            try {
                const errorText = await response.text();
                errorMessage = errorText || 'An error occurred';
            } catch {
                errorMessage = 'Network error occurred';
            }
        }
        
        throw new Error(errorMessage);
    }
    return response.json();
}

// Login Form Handler
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        try {
            const response = await fetch(`${API_BASE_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await handleResponse(response);
            
            // Store JWT token in localStorage - handle different response formats
            const token = data.token || data.accessToken || data.jwt || data.access_token;
            if (!token) {
                throw new Error('No token received from server');
            }
            
            // Check if token contains an error message instead of actual token
            if (typeof token === 'string' && 
                (token.toLowerCase().includes('invalid') || 
                 token.toLowerCase().includes('error') ||
                 token.toLowerCase().includes('not found'))) {
                throw new Error('Invalid email or password. Please try again.');
            }
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(data.user || data.userInfo || { email }));

            showMessage('Login successful! Redirecting...', 'success');

            // Redirect to dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);

        } catch (error) {
            showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    });
}

// Signup Form Handler
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitBtn = signupForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ firstName, lastName, email, password })
            });

            await handleResponse(response);

            showMessage('Account created successfully! Redirecting to login...', 'success');

            // Redirect to login page
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);

        } catch (error) {
            showMessage(error.message || 'Registration failed. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}

// Google OAuth2 Login Handler
function handleGoogleLogin() {
    try {
        // Redirect to OAuth2 authorization endpoint
        window.location.href = "https://spending-h227.onrender.com/oauth2/authorization/google";
    } catch (error) {
        console.error('Google OAuth2 login error:', error);
        showMessage('Failed to initiate Google login. Please try again.', 'error');
    }
}

// Check if user is already logged in on login/signup pages
function checkAuth() {
    const token = localStorage.getItem('token');
    const currentPage = window.location.pathname.split('/').pop();
    
    // Only redirect if there's a valid token AND user is on login/signup page
    if (token && (currentPage === 'index.html' || currentPage === 'signup.html' || currentPage === '')) {
        // Optionally validate token before redirecting
        // For now, we'll redirect to dashboard
        console.log('User already logged in, redirecting to dashboard...');
        window.location.href = 'dashboard.html';
    }
}

// Run auth check only when needed
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

// Password visibility toggle functionality
document.addEventListener('DOMContentLoaded', () => {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const eyeIcon = this.querySelector('.eye-icon');
            
            if (passwordInput) {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                
                // Update icon based on state
                if (isPassword) {
                    eyeIcon.textContent = '👁️‍🗨️'; // Eye with slash or different icon
                    this.setAttribute('aria-label', 'Hide password');
                } else {
                    eyeIcon.textContent = '👁️';
                    this.setAttribute('aria-label', 'Show password');
                }
            }
        });
    });
    
    // Initialize Forgot Password functionality
    initForgotPassword();
});

// Forgot Password Functionality
function initForgotPassword() {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');
    const closeForgotPasswordModal = document.getElementById('closeForgotPasswordModal');
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const otpModal = document.getElementById('otpModal');
    const closeOtpModal = document.getElementById('closeOtpModal');
    const otpForm = document.getElementById('otpForm');
    
    // Open forgot password modal
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            if (forgotPasswordModal) {
                forgotPasswordModal.classList.add('active');
                if (forgotPasswordForm) forgotPasswordForm.reset();
            }
        });
    }
    
    // Close modals
    if (closeForgotPasswordModal) {
        closeForgotPasswordModal.addEventListener('click', () => {
            if (forgotPasswordModal) forgotPasswordModal.classList.remove('active');
        });
    }
    
    if (closeOtpModal) {
        closeOtpModal.addEventListener('click', () => {
            if (otpModal) otpModal.classList.remove('active');
        });
    }
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (forgotPasswordModal && forgotPasswordModal.classList.contains('active')) {
            if (!forgotPasswordModal.contains(e.target) && e.target !== forgotPasswordLink) {
                forgotPasswordModal.classList.remove('active');
            }
        }
        
        if (otpModal && otpModal.classList.contains('active')) {
            if (!otpModal.contains(e.target)) {
                otpModal.classList.remove('active');
            }
        }
    });
    
    // Forgot Password Form Handler
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail').value;
            
            if (!email) {
                showMessage('Please enter your email address', 'error');
                return;
            }
            
            const submitBtn = forgotPasswordForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            try {
                const response = await fetch('https://spending-h227.onrender.com/api/auth/forgot-password?email=' + encodeURIComponent(email), {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showMessage('OTP sent to your email successfully!', 'success');
                    if (forgotPasswordModal) forgotPasswordModal.classList.remove('active');
                    if (otpModal) {
                        otpModal.classList.add('active');
                        if (otpForm) otpForm.reset();
                    }
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to send OTP' }));
                    showMessage(errorData.message || 'Failed to send OTP', 'error');
                }
            } catch (error) {
                console.error('Error sending OTP:', error);
                showMessage('An error occurred while sending OTP', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send OTP';
            }
        });
    }
    
    // OTP Form Handler
    if (otpForm) {
        otpForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const otp = document.getElementById('otpCode').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmNewPassword').value;
            const email = document.getElementById('resetEmail').value;
            
            // Validation
            if (!otp || !newPassword || !confirmPassword) {
                showMessage('Please fill in all fields', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showMessage('Passwords do not match', 'error');
                return;
            }
            
            if (newPassword.length < 6) {
                showMessage('Password must be at least 6 characters long', 'error');
                return;
            }
            
            const submitBtn = otpForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Resetting...';
            
            try {
                const response = await fetch('https://spending-h227.onrender.com/api/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        otp: otp,
                        newPassword: newPassword
                    })
                });
                
                if (response.ok) {
                    showMessage('Password reset successfully! You can now login with your new password.', 'success');
                    if (otpModal) otpModal.classList.remove('active');
                } else {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to reset password' }));
                    showMessage(errorData.message || 'Failed to reset password', 'error');
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                showMessage('An error occurred while resetting password', 'error');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Reset Password';
            }
        });
    }
}
