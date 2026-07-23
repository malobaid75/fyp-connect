// Minor client-side touch: confirm before any destructive action
// that doesn't already have an inline confirm attached.
document.querySelectorAll('form.danger-confirm').forEach(form => {
  form.addEventListener('submit', (e) => {
    if (!confirm('Are you sure?')) e.preventDefault();
  });
});