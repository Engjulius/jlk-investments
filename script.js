// Configuration
const CONFIG = {
    // Replace with your Google Apps Script Web App URL
    // See instructions below on how to set this up
    GOOGLE_SHEET_URL: 'https://script.google.com/macros/d/YOUR_SCRIPT_ID/usercontent',
    
    // Validation patterns
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^[\d\s\-\+\(\)]{10,}$/,
};

// Form References
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginFormElement = document.getElementById('loginFormElement');
const signupFormElement = document.getElementById('signupFormElement');
const loader = document.getElementById('loader');
const successModal = document.getElementById('successModal');
const successMessage = document.getElementById('successMessage');

// ==========================================
// FORM SWITCHING
// ==========================================
function toggleForms(e) {
    e.preventDefault();
    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
    clearAllErrors();
}

// ==========================================
// VALIDATION FUNCTIONS
// ==========================================
function validateEmail(email) {
    return CONFIG.EMAIL_PATTERN.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

function validatePasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[@$!%*?&]+/)) strength++;
    return strength;
}

function validatePhone(phone) {
    return phone === '' || CONFIG.PHONE_PATTERN.test(phone);
}

function updatePasswordStrength(password) {
    const strength = validatePasswordStrength(password);
    const strengthBar = document.getElementById('passwordStrength');
    const bar = strengthBar.querySelector('.strength-bar');
    
    const percentages = [0, 20, 40, 60, 80, 100];
    const colors = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#10b981'];
    
    bar.style.width = percentages[strength] + '%';
    bar.style.backgroundColor = colors[Math.min(strength - 1, 3)];
}

function clearError(elementId) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = '';
    }
}

function setError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => el.textContent = '');
}

// ==========================================
// LOGIN VALIDATION
// ==========================================
function validateLoginForm() {
    clearAllErrors();
    let isValid = true;
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email) {
        setError('loginEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        setError('loginEmailError', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        setError('loginPasswordError', 'Password is required');
        isValid = false;
    } else if (password.length < 6) {
        setError('loginPasswordError', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

// ==========================================
// SIGNUP VALIDATION
// ==========================================
function validateSignupForm() {
    clearAllErrors();
    let isValid = true;
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('signupConfirm').value;
    const phone = document.getElementById('signupPhone').value.trim();
    const agreeTerms = document.getElementById('agreeTerms').checked;
    
    if (!name) {
        setError('signupNameError', 'Full name is required');
        isValid = false;
    } else if (name.length < 2) {
        setError('signupNameError', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!email) {
        setError('signupEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        setError('signupEmailError', 'Please enter a valid email');
        isValid = false;
    }
    
    if (!password) {
        setError('signupPasswordError', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        setError('signupPasswordError', 'Password must be at least 8 characters');
        isValid = false;
    }
    
    if (!confirm) {
        setError('signupConfirmError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirm) {
        setError('signupConfirmError', 'Passwords do not match');
        isValid = false;
    }
    
    if (phone && !validatePhone(phone)) {
        setError('signupPhoneError', 'Please enter a valid phone number');
        isValid = false;
    }
    
    if (!agreeTerms) {
        setError('signupError', 'You must agree to the Terms & Conditions');
        isValid = false;
    }
    
    return isValid;
}

// ==========================================
// GOOGLE SHEETS INTEGRATION
// ==========================================
async function submitDataToGoogleSheets(data, action) {
    try {
        showLoader(true);
        
        const response = await fetch(CONFIG.GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: action,
                data: data,
                timestamp: new Date().toLocaleString()
            })
        });
        
        // Note: With no-cors mode, we can't read the response directly
        // Success is assumed if no error is thrown
        return { success: true };
    } catch (error) {
        console.error('Error submitting to Google Sheets:', error);
        return { success: false, error: error.message };
    }
}

// ==========================================
// FORM SUBMISSION HANDLERS
// ==========================================
loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateLoginForm()) {
        return;
    }
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    const loginData = {
        email: email,
        password: password,
        rememberMe: rememberMe,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
    };
    
    const result = await submitDataToGoogleSheets(loginData, 'LOGIN');
    
    if (result.success) {
        // Store in localStorage if remember me is checked
        if (rememberMe) {
            localStorage.setItem('jlk_email', email);
        }
        
        showSuccess('Login Successful!', 'Welcome back! Redirecting...');
        setTimeout(() => {
            // Redirect to dashboard or next page
            window.location.href = 'dashboard.html';
        }, 2000);
    } else {
        setError('loginError', 'An error occurred. Please try again.');
    }
    
    showLoader(false);
});

signupFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
        return;
    }
    
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const phone = document.getElementById('signupPhone').value.trim();
    
    const signupData = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        registrationDate: new Date().toISOString(),
        ipAddress: 'unknown', // Would need server-side to capture
        userAgent: navigator.userAgent
    };
    
    const result = await submitDataToGoogleSheets(signupData, 'SIGNUP');
    
    if (result.success) {
        showSuccess('Account Created!', 'Your account has been created successfully. Redirecting to login...');
        setTimeout(() => {
            // Reset form and switch to login
            signupFormElement.reset();
            document.getElementById('passwordStrength').querySelector('.strength-bar').style.width = '0%';
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        }, 2000);
    } else {
        setError('signupError', 'An error occurred. Please try again.');
    }
    
    showLoader(false);
});

// ==========================================
// PASSWORD STRENGTH INDICATOR
// ==========================================
document.getElementById('signupPassword').addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value);
});

// ==========================================
// REMEMBER ME FUNCTIONALITY
// ==========================================
window.addEventListener('load', () => {
    const savedEmail = localStorage.getItem('jlk_email');
    if (savedEmail) {
        document.getElementById('loginEmail').value = savedEmail;
        document.getElementById('rememberMe').checked = true;
    }
});

// ==========================================
// GOOGLE OAUTH (Optional)
// ==========================================
document.getElementById('googleLoginBtn').addEventListener('click', () => {
    console.log('Google Login - Implement OAuth integration');
    // Implement Google OAuth here
});

document.getElementById('googleSignupBtn').addEventListener('click', () => {
    console.log('Google Signup - Implement OAuth integration');
    // Implement Google OAuth here
});

// ==========================================
// UI HELPER FUNCTIONS
// ==========================================
function showLoader(show) {
    if (show) {
        loader.classList.add('show');
    } else {
        loader.classList.remove('show');
    }
}

function showSuccess(title, message) {
    successMessage.textContent = message;
    successModal.classList.add('show');
}

function closeModal() {
    successModal.classList.remove('show');
}

// ==========================================
// KEYBOARD SHORTCUTS
// ==========================================
document.addEventListener('keydown', (e) => {
    // ESC to close modal
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Close modal when clicking outside
successModal.addEventListener('click', (e) => {
    if (e.target === successModal) {
        closeModal();
    }
});

console.log('✓ Auth page loaded and ready');
