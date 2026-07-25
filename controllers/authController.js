const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

// Render the registration page.
exports.showRegister = (req, res) => {
  res.render('auth/register', { error: null });
};

// Handle user registration form submission.
// - Validates presence of required fields
// - Prevents duplicate accounts by email
// - Hashes the password before storing
// - Stores minimal user info in the session and redirects based on role
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.render('auth/register', { error: 'All fields are required.' });
  }

  // Prevent duplicate accounts
  const existing = await userModel.findByEmail(email);
  if (existing) {
    return res.render('auth/register', { error: 'An account with that email already exists.' });
  }

  // Hash password with bcrypt (10 rounds) before creating user
  const hashed = await bcrypt.hash(password, 10);
  const userId = await userModel.create({ name, email, password: hashed, role });

  // Persist basic user info in session for authentication checks
  req.session.user = { id: userId, name, email, role };
  res.redirect(role === 'staff' ? '/staff/dashboard' : '/student/directory');
};

// Render login page.
exports.showLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

// Handle login attempts: verify credentials and set session.
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findByEmail(email);

  // If user not found or password mismatch, show a generic error
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('auth/login', { error: 'Incorrect email or password.' });
  }

  // Save essential user info in session and redirect based on role
  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.redirect(user.role === 'staff' ? '/staff/dashboard' : '/student/directory');
};

// Logout helper: destroy the session and redirect to login
exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};