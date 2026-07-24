function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect('/login');
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
}

function redirectIfLoggedIn(req, res, next) {
  if (req.session.user) {
    return res.redirect(req.session.user.role === 'staff' ? '/staff/dashboard' : '/student/directory');
  }
  next();
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.session.user || req.session.user.role !== role) {
      return res.status(403).send('Access denied.');
    }
    next();
  };
}

module.exports = { requireLogin, requireRole, redirectIfLoggedIn };