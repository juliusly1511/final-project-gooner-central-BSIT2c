// employer_login.js

const navigateTo = {
    employerRegister: () => {
        window.location.href = "../employer-register/employer_register.html";
    },
    selection: () => {
        window.location.href = "../../Selection.html";
    },
    employerDashboard: () => {
        window.location.href = "../employer-dashboard/employer_dashboard.html";
    }
};

// ✅ Automatic redirect after successful login
document.getElementById("employerLoginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    // Show success message
    const successMessage = document.getElementById("successMessage");
    successMessage.style.display = "block";

    // Countdown logic
    let countdown = 3;
    const countdownElement = document.getElementById("countdown");
    countdownElement.textContent = countdown;

    const interval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;

        if (countdown === 0) {
            clearInterval(interval);
            // Use your existing navigation function
            navigateTo.employerDashboard();
        }
    }, 1000);
});

        const form = document.getElementById('employerLoginForm');
        const successMessage = document.getElementById('successMessage');
        const countdownSpan = document.getElementById('countdown');
        const loginBtn = document.querySelector('.login-btn');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const companyId = document.getElementById('companyId').value;
            const password = document.getElementById('employerPassword').value;
            
            if (!companyId || !password) {
                alert('Please enter Company ID and Password');
                return;
            }

            // Show loading
            loginBtn.textContent = 'Signing In...';
            loginBtn.disabled = true;

            // Simulate API call
            setTimeout(() => {
                console.log('Employer Login Data:', { companyId, password });
                
                // Hide form, show success
                form.style.display = 'none';
                successMessage.style.display = 'block';
                
                // Countdown to employer dashboard
                let countdown = 3;
                const interval = setInterval(() => {
                    countdown--;
                    countdownSpan.textContent = countdown;
                    if (countdown <= 0) {
                        clearInterval(interval);
                        navigateTo.employerDashboard();
                    }
                }, 1000);
                
            }, 2000);
        });