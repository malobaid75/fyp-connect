// Ensure a user is authenticated; if not, redirect to the login page.
// Also sets conservative cache headers to prevent pages with sensitive
// information from being cached by browsers or intermediary proxies.
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
}

// If user is already authenticated, redirect them to their appropriate
// dashboard rather than showing login/register pages.
function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'staff' ? '/staff/dashboard' : '/student/directory');
  }
  next();
}

// Factory that returns middleware enforcing a specific role (e.g. 'staff').
// Responds with 403 on mismatch.
function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).send('Access denied.');
    }
    next();
  };
}

module.exports = { requireLogin, requireRole, redirectIfLoggedIn };