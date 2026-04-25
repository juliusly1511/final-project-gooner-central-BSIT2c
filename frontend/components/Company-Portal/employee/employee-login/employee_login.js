const form = document.getElementById('loginForm');
const successMessage = document.getElementById('successMessage');
const countdownSpan = document.getElementById('countdown');
const loginBtn = document.querySelector('.login-btn');
const employeeIdInput = document.getElementById('employeeId');
const passwordInput = document.getElementById('password');

// Navigation (adjust paths for your structure)
window.navigateTo = {
    selection: () => window.location.href = '../../Selection.html',
    employeeRegister: () => window.location.href = '../employee-register/employee_register.html',
    employeeDashboard: () => window.location.href = 'dashboard.html' // Adjust path
};

// Utils for validation
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
        if (error) error.style.display = 'none';
        element.style.borderColor = '#e1e8ed';
    },
    
    resetForm: () => {
        utils.hideError(employeeIdInput);
        utils.hideError(passwordInput);
        employeeIdInput.value = '';
        passwordInput.value = '';
        employeeIdInput.focus();
    }
};

//Real-time Employee ID validation (EMP-XXXXXX)
employeeIdInput.addEventListener('input', function() {
    const id = this.value.toUpperCase().replace(/[^EMP1234567890-]/g, '');
    this.value = id;
    
    if (id) {
        if (/^EMP-\d{6}$/.test(id)) {
            utils.hideError(this);
            this.style.borderColor = '#27ae60'; // Green ✓
        } else {
            utils.showError(this, 'Format: EMP-XXXXXX (6 digits)');
        }
    } else {
        utils.hideError(this);
    }
});

//Password field cleanup
passwordInput.addEventListener('input', function() {
    utils.hideError(this);
});

//Form submission - Dashboard ONLY on success
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const employeeId = employeeIdInput.value.trim();
    const password = passwordInput.value;
    
    utils.hideError(employeeIdInput);
    
    if (!employeeId || !password) {
        alert('Please enter Employee ID and Password');
        utils.resetForm();
        return;
    }
    
    if (!/^EMP-\d{6}$/.test(employeeId)) {
        utils.showError(employeeIdInput, 'Invalid format: EMP-XXXXXX');
        employeeIdInput.focus();
        return;
    }

    loginBtn.textContent = 'Signing In...';
    loginBtn.disabled = true;

    try {
        console.log('Login attempt:', { employeeId, password });
        
        // Simulate API (replace with real fetch)
        const isValid = employeeId === 'EMP-123456' && password === 'password123';
        
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        
        console.log('Login SUCCESS');
        form.style.display = 'none';
        successMessage.style.display = 'block';
        
        let countdown = 3;
        countdownSpan.textContent = countdown;
        const interval = setInterval(() => {
            countdown--;
            countdownSpan.textContent = countdown;
            if (countdown <= 0) {
                clearInterval(interval);
                navigateTo.employeeDashboard(); //Dashboard ONLY on success
            }
        }, 1000);
        
    } catch (error) {
        console.log('❌ Login FAILED:', error.message);
        alert(`Login failed: ${error.message}`);
        loginBtn.textContent = 'Sign In';
        loginBtn.disabled = false;
        employeeIdInput.focus();
    }
});

//LINK HANDLERS (DOMContentLoaded ensures elements exist)
document.addEventListener('DOMContentLoaded', function() {
    // Back to Selection
    const backToSelectionBtn = document.getElementById('backToSelection');
    if (backToSelectionBtn) {
        backToSelectionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo.selection(); // Uses your navigateTo
        });
    }

    // Create Employee Account
    const createAccountBtn = document.getElementById('createAccount');
    if (createAccountBtn) {
        createAccountBtn.addEventListener('click', function(e) {
            e.preventDefault();
            navigateTo.employeeRegister(); // Uses your navigateTo
        });
    }
});

// ESC key = Reset form
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        utils.resetForm();
    }
});