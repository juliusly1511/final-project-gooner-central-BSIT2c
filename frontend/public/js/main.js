// Client-side niceties. Add interactivity here.
document.addEventListener('DOMContentLoaded', () => {
  
  // ========== Confirm before destructive actions ==========
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!confirm(form.dataset.confirm)) e.preventDefault();
    });
  });

  // ========== Role toggle for company field (registration page) ==========
  const roleRadios = document.querySelectorAll('input[name="role"]');
  const companyField = document.getElementById('company-field');
  
  if (roleRadios && companyField) {
    roleRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.value === 'employer' && radio.checked) {
          companyField.style.display = 'block';
        } else {
          companyField.style.display = 'none';
        }
      });
    });
  }
});

// ========== Google Sign-In initialization ==========
function initializeGoogleSignIn() {
  const googleBtn = document.getElementById('google-signin-btn');
  if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
      window.location.href = '/auth/google';
    });
  }
}

// Call this when you add a Google Sign-In button
// initializeGoogleSignIn();