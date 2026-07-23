const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

exports.showRegister = (req, res) => {
  res.render('auth/register', { error: null });
};

exports.register = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.render('auth/register', { error: 'All fields are required.' });
  }

  const existing = await userModel.findByEmail(email);
  if (existing) {
    return res.render('auth/register', { error: 'An account with that email already exists.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const userId = await userModel.create({ name, email, password: hashed, role });

  req.session.user = { id: userId, name, email, role };
  res.redirect(role === 'staff' ? '/staff/dashboard' : '/student/directory');
};

exports.showLogin = (req, res) => {
  res.render('auth/login', { error: null });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await userModel.findByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('auth/login', { error: 'Incorrect email or password.' });
  }

  req.session.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  res.redirect(user.role === 'staff' ? '/staff/dashboard' : '/student/directory');
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
};