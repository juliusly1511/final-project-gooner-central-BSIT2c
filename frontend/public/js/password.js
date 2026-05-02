// Password strength meter + confirm-match check
(function () {
  const pw = document.getElementById('pw');
  const pw2 = document.getElementById('pw2');
  const bar = document.getElementById('pwBar');
  const label = document.getElementById('pwLabel');
  const match = document.getElementById('pwMatch');
  if (!pw || !bar || !label) return;

  const labels = ['Very weak', 'Weak', 'Okay', 'Good', 'Strong'];
  const colors = ['#d93025', '#e67e22', '#f1c40f', '#27ae60', '#0a8a5b'];

  function score(s) {
    let n = 0;
    if (!s) return 0;
    if (s.length >= 8) n++;
    if (/[a-z]/.test(s) && /[A-Z]/.test(s)) n++;
    if (/\d/.test(s)) n++;
    if (/[^A-Za-z0-9]/.test(s)) n++;
    if (s.length >= 12) n++;
    return Math.min(n, 4);
  }

  function update() {
    const s = score(pw.value);
    const pct = (s / 4) * 100;
    bar.style.width = pct + '%';
    bar.style.background = colors[s];
    label.textContent = 'Strength: ' + labels[s];
    label.style.color = colors[s];
  }
  function updateMatch() {
    if (!pw2 || !match) return;
    if (!pw2.value) { match.textContent = ''; return; }
    if (pw.value === pw2.value) {
      match.textContent = '✓ Passwords match';
      match.style.color = '#0a8a5b';
    } else {
      match.textContent = '✗ Passwords do not match';
      match.style.color = '#d93025';
    }
  }
  pw.addEventListener('input', () => { update(); updateMatch(); });
  if (pw2) pw2.addEventListener('input', updateMatch);
  update();
})();
