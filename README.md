# fyp-connect

FYP Connect is a web application built for the Final Year Project supervisor and idea matching problem. It allows academic staff to publish and manage their areas of interest and project ideas, and allows students to browse, search, and identify a suitable supervisor and project.

## Tech stack

- Node.js with Express (Controller layer)
- EJS templates, HTML, CSS, JavaScript (View layer)
- SQLite (Model / data layer)
- bcryptjs for password hashing
- express-session for authentication state

## Getting started

### Prerequisites
- Node.js
- npm

### Installation

```bash
git https://github.com/malobaid75/fyp-connect.git
cd fyp-connect
npm install
```

### Running the app

```bash
npm start
```

The app will be available at `http://localhost:3000`. The SQLite database file is created automatically on first run no manual setup needed.

### Running Unit tests

```bash
npm test
```

## Project structure

```text
fyp-connect/
├── server.js
├── db/
├── models/
├── controllers/
├── views/
├── routes/
├── tests/
├── middleware/
└── public/
```

## Features

- Staff registration and login
- Staff: add, edit, delete areas of interest
- Staff: add, edit, delete project ideas
- Staff: set supervision capacity
- Student: browse staff directory
- Student: view full staff profile
- Student: search/filter by keyword or area
- Student: contact a staff member directly from their profile

