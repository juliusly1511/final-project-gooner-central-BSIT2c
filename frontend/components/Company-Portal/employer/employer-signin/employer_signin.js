
        const form = document.getElementById('employerRegisterForm');
        const passwordInput = document.getElementById('employerPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');
        const strengthIndicator = document.getElementById('strengthIndicator');
        const termsCheckbox = document.getElementById('terms');
        const registerBtn = document.querySelector('.register-btn');

        // Password strength checker
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

        // Form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = passwordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            if (!termsCheckbox.checked) {
                alert('Please accept Terms & Conditions');
                return;
            }
            
            if (password.length < 8) {
                alert('Password must be 8+ characters');
                return;
            }

            // Loading state
            registerBtn.textContent = 'Creating Account...';
            registerBtn.disabled = true;

            // Simulate API
            setTimeout(() => {
                const formData = new FormData(form);
                console.log('Employer Registration:', Object.fromEntries(formData));
                
                form.style.display = 'none';
                document.getElementById('successMessage').style.display = 'block';
                
                let countdown = 3;
                const interval = setInterval(() => {
                    countdown--;
                    document.getElementById('countdown').textContent = countdown;
                    if (countdown <= 0) {
                        clearInterval(interval);
                        navigateTo.employerLogin();
                    }
                }, 1000);
            }, 2000);
        });