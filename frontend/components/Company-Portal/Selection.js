        const navigateTo = {
            employeeLogin: () => {
                window.location.href = 'employee/employee-login/employee_login.html';
            },
            employeeRegister: () => {
                window.location.href = 'employee/employee-register/employee_register.html';
            },
            employerLogin: () => {
                window.location.href = 'employer/employer-login/employer_login.html';
            },
            employerRegister: () => {
                window.location.href = 'employer/employer-signin/employer_signin.html';
            }
            
        };

// ESC key = Selection.html
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') navigateTo.selection();
            // Role card click handlers
        document.querySelectorAll('.role-card').forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.tagName === 'A') return;
                document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
                this.classList.add('selected');
            });
        });

        document.querySelectorAll('.role-links a').forEach(link => {
            link.addEventListener('click', () => {
                document.querySelectorAll('.role-card').forEach(c => c.classList.remove('selected'));
                
            });
        });
});