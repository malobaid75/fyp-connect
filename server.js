/**
 * Entry point for the FYP Connect web application.
 * Sets up Express, view engine, static assets, session handling,
 * and mounts the application routes.
 */
const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

// Route modules (grouped by feature)
const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Configure view engine and views folder for server-side rendering
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Built-in middleware to parse URL-encoded POST bodies
app.use(express.urlencoded({ extended: true }));

// Serve static files (CSS, client JS, images) from the `public` folder
app.use(express.static(path.join(__dirname, 'public')));

// Allow HTML forms to simulate PUT/DELETE via the `_method` query/value
app.use(methodOverride('_method'));

// Session configuration used for simple auth/session persistence in dev
app.use(session({
  secret: 'fyp-connect-dev-secret',
  resave: false,
  saveUninitialized: false,
  // 4 hours cookie lifetime
  cookie: { maxAge: 1000 * 60 * 60 * 4 }
}));

// Make the current user (if any) available to all rendered views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// Root redirect to login page
app.get('/', (req, res) => res.redirect('/login'));

// Mount feature routes
app.use('/', authRoutes);
app.use('/staff', staffRoutes);
app.use('/student', studentRoutes);

// Start server only when run directly (this prevents the server from
// automatically starting when tests `require` this module).
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`FYP Connect running on http://localhost:${PORT}`));
}

module.exports = app;