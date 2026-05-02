// Client-side niceties. Add interactivity here.
document.addEventListener('DOMContentLoaded', () => {
  // Confirm before destructive actions
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      if (!confirm(form.dataset.confirm)) e.preventDefault();
    });
  });
});
