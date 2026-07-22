const express = require('express');
const session = require('express-session');
const methodOverride = require('method-override');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const staffRoutes = require('./routes/staffRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

app.use(session({
  secret: 'fyp-connect-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 4 }
}));

app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.get('/', (req, res) => res.redirect('/login'));

app.use('/', authRoutes);
app.use('/staff', staffRoutes);
app.use('/student', studentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FYP Connect running on http://localhost:${PORT}`));