// FIXED: Complete utils + navigateTo + Phone regex
window.navigateTo = {
    selection: () => window.location.href = '../../Selection.html',
    employeeLogin: () => window.location.href = '../employee-login/employee_login.html',
    employerLogin: () => window.location.href = '../employer-login/employer_login.html',
    employerSignin: () => window.location.href = '../employer-signin/employer_signin.html'
};

const utils = {
    showError: (element, message) => {
        let error = element.parentNode.querySelector('.error-message');
        if (!error) {
            error = document.createElement('div');
            error.className = 'error-message';
            element.parentNode.appendChild(error);
        }
        error.textContent = message;
        error.style.display = 'block';
        element.style.borderColor = '#e74c3c';
    },
    
    hideError: (element) => {
        const error = element.parentNode.querySelector('.error-message');
        if (error) {
            error.style.display = 'none';
        }
        element.style.borderColor = '#e1e8ed';
    }
};

const form = document.getElementById('employeeRegisterForm');
const emailInput = document.getElementById('email');
const employeeIdInput = document.getElementById('employeeId');
const phoneInput = document.getElementById('phone');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const strengthIndicator = document.getElementById('strengthIndicator');
const termsCheckbox = document.getElementById('terms');
const registerBtn = document.querySelector('.register-btn');

//EMAIL VALIDATION (Real-time)
emailInput.addEventListener('input', function() {
    const email = this.value.trim();
    if (email) {
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            utils.hideError(this);
            this.style.borderColor = '#27ae60';
        } else {
            utils.showError(this, 'Enter valid email (name@company.com)');
        }
    } else {
        utils.hideError(this);
    }
});

//EMPLOYEE ID VALIDATION (EMP-XXXXXX - 6 digits)
employeeIdInput.addEventListener('input', function() {
    const id = this.value.toUpperCase().replace(/[^EMP-\d]/g, '');
    this.value = id;
    
    if (id) {
        if (/^EMP-\d{6}$/.test(id)) {
            utils.hideError(this);
            this.style.borderColor = '#27ae60';
        } else {
            utils.showError(this, 'Format: EMP-XXXXXX (6 digits)');
        }
    } else {
        utils.hideError(this);
    }
});

//PHONE VALIDATION (Fixed regex - allows +1 (555) 123-4567)
phoneInput.addEventListener('input', function() {
    const phone = this.value;
    const cleanPhone = phone.replace(/[\s\-\$\$]/g, ''); // Remove spaces, dashes, parentheses
    
    if (phone && cleanPhone) {
        if (/^[\+]?[1-9][\d]{7,15}$/.test(cleanPhone)) { // At least 8 digits
            utils.hideError(this);
            this.style.borderColor = '#27ae60';
        } else {
            utils.showError(this, 'Enter valid phone (+1 (555) 123-4567)');
        }
    } else {
        utils.hideError(this);
    }
});

// Password strength
passwordInput.addEventListener('input', function() {
    const password = this.value;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    strengthIndicator.className = 'strength-indicator';
    if (strength <= 2) strengthIndicator.classList.add('strength-weak');
    else if (strength <= 3) strengthIndicator.classList.add('strength-medium');
    else strengthIndicator.classList.add('strength-strong');
});

// Form submission with ALL validation
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    const employeeId = employeeIdInput.value;
    const phone = phoneInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;
    
    // Reset all errors first
    utils.hideError(emailInput);
    utils.hideError(employeeIdInput);
    utils.hideError(phoneInput);
    
    let hasError = false;
    
    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        utils.showError(emailInput, 'Invalid email format');
        hasError = true;
    }
    
    // Employee ID validation
    if (!/^EMP-\d{6}$/.test(employeeId.toUpperCase())) {
        utils.showError(employeeIdInput, 'Invalid Employee ID (EMP-XXXXXX)');
        hasError = true;
    }
    
    // Phone validation (if filled)
    const cleanPhone = phone.replace(/[\s\-\$\$]/g, '');
    if (phone && !/^[\+]?[1-9][\d]{7,15}$/.test(cleanPhone)) {
        utils.showError(phoneInput, 'Invalid phone number');
        hasError = true;
    }
    
    // Password validation
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        confirmPasswordInput.focus();
        return;
    }
    
    if (password.length < 8) {
        alert('Password must be 8+ characters');
        passwordInput.focus();
        return;
    }
    
    if (!termsCheckbox.checked) {
        alert('Please accept Terms & Conditions');
        termsCheckbox.focus();
        return;
    }
    
    if (hasError) {
        // Focus first error
        document.querySelector('.error-message[style*="block"]')?.previousElementSibling?.focus();
        return;
    }

    // ALL PASSED - shows loading state
    registerBtn.textContent = 'Creating Account...';
    registerBtn.disabled = true;

    setTimeout(() => {
        const formData = new FormData(form);
        console.log('Employee Registration:', Object.fromEntries(formData));
        
        form.style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
        
        let countdown = 3;
        const interval = setInterval(() => {
            countdown--;
            document.getElementById('countdown').textContent = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                navigateTo.employeeLogin(); // Uses your navigateTo path
            }
        }, 1000);
    }, 2000);
});