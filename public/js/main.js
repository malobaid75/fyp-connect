// Lightweight client-side behavior: add a confirmation dialog to any
// form that carries the `danger-confirm` CSS class. This prevents accidental
// deletion or other destructive actions when the user submits the form.
document.querySelectorAll('form.danger-confirm').forEach(form => {
  form.addEventListener('submit', (e) => {
    if (!confirm('Are you sure?')) e.preventDefault();
  });
});