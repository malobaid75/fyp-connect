process.env.DB_FILE = 'test_routes.db';
const fs = require('fs');
const path = require('path');
const dbFilePath = path.join(__dirname, '../db/test_routes.db');

const request = require('supertest');
const app = require('../server');

beforeAll((done) => {
  setTimeout(done, 200);
});

afterAll(() => {
  try {
    if (fs.existsSync(dbFilePath)) fs.unlinkSync(dbFilePath);
  } catch (err) {
    // On Windows, sqlite3 may still hold a file lock briefly after tests finish.
    // Safe to ignore — the file is in .gitignore and gets overwritten next run.
  }
});

describe('Access control (FR13)', () => {
  test('invalid partition: visiting /staff/dashboard without logging in redirects to /login', async () => {
    const res = await request(app).get('/staff/dashboard');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('invalid partition: visiting /student/directory without logging in redirects to /login', async () => {
    const res = await request(app).get('/student/directory');
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});

describe('Registration and login (auth flow)', () => {
  test('valid partition: registering a new staff account succeeds and redirects to dashboard', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send({ name: 'Dr Route Test', email: 'routetest@test.edu', password: 'password123', role: 'staff' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/staff/dashboard');
  });

  test('invalid partition: registering with an email already in use is rejected', async () => {
    const res = await request(app)
      .post('/register')
      .type('form')
      .send({ name: 'Dr Duplicate', email: 'routetest@test.edu', password: 'password123', role: 'staff' });
    expect(res.status).toBe(200); // re-renders the register form with an error
    expect(res.text).toContain('already exists');
  });

  test('valid partition: logging in with correct credentials redirects to dashboard', async () => {
    const agent = request.agent(app); // keeps cookies across requests
    const res = await agent
      .post('/login')
      .type('form')
      .send({ email: 'routetest@test.edu', password: 'password123' });
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/staff/dashboard');
  });

  test('invalid partition: logging in with the wrong password is rejected', async () => {
    const res = await request(app)
      .post('/login')
      .type('form')
      .send({ email: 'routetest@test.edu', password: 'wrongpassword' });
    expect(res.status).toBe(200);
    expect(res.text).toContain('Incorrect email or password');
  });
});

describe('Staff CRUD via an authenticated session (FR1, FR4, NFR4)', () => {
  let agent;

  beforeAll(async () => {
    agent = request.agent(app);
    await agent
      .post('/register')
      .type('form')
      .send({ name: 'Dr Session Staff', email: 'sessionstaff@test.edu', password: 'password123', role: 'staff' });
  });

  test('valid partition: an authenticated staff member can add an area of interest', async () => {
    const res = await agent
      .post('/staff/areas')
      .type('form')
      .send({ name: 'Cybersecurity', description: 'Network and application security' });
    expect(res.status).toBe(302);

    const dashboard = await agent.get('/staff/dashboard');
    expect(dashboard.text).toContain('Cybersecurity');
  });

  test('invalid partition: submitting an empty area name does not create a row', async () => {
    const before = await agent.get('/staff/dashboard');
    const res = await agent
      .post('/staff/areas')
      .type('form')
      .send({ name: '', description: 'should not be created' });
    const after = await agent.get('/staff/dashboard');
    expect(after.text).not.toContain('should not be created');
  });

  test('boundary partition: setting capacity to 0 is accepted', async () => {
    const res = await agent
      .post('/staff/capacity')
      .type('form')
      .send({ capacity: '0' });
    expect(res.status).toBe(302);

    const dashboard = await agent.get('/staff/dashboard');
    expect(dashboard.text).toContain('value="0"');
  });

  test('invalid partition: setting a negative capacity is rejected', async () => {
    await agent.post('/staff/capacity').type('form').send({ capacity: '0' });
    const res = await agent.post('/staff/capacity').type('form').send({ capacity: '-5' });
    const dashboard = await agent.get('/staff/dashboard');
    expect(dashboard.text).not.toContain('value="-5"');
  });
});

describe('Ownership enforcement across staff accounts (NFR4)', () => {
  test('invalid partition: staff member B cannot edit an area belonging to staff member A', async () => {
    const agentA = request.agent(app);
    await agentA.post('/register').type('form').send({ name: 'Staff A', email: 'staffA@test.edu', password: 'password123', role: 'staff' });
    await agentA.post('/staff/areas').type('form').send({ name: 'Owned By A', description: 'desc' });
    const dashboardA = await agentA.get('/staff/dashboard');
    const match = dashboardA.text.match(/staff\/areas\/(\d+)\?_method=PUT/);
    const areaId = match[1];

    const agentB = request.agent(app);
    await agentB.post('/register').type('form').send({ name: 'Staff B', email: 'staffB@test.edu', password: 'password123', role: 'staff' });

    const res = await agentB
      .put(`/staff/areas/${areaId}`)
      .type('form')
      .send({ name: 'Hijacked Name', description: 'desc' });

    expect(res.status).toBe(403);
  });
});

describe('Student browsing and search (FR7, FR9, FR10)', () => {
  let studentAgent;

  beforeAll(async () => {
    studentAgent = request.agent(app);
    await studentAgent
      .post('/register')
      .type('form')
      .send({ name: 'Test Student', email: 'teststudent@test.edu', password: 'password123', role: 'student' });
  });

  test('valid partition: student can load the staff directory', async () => {
    const res = await studentAgent.get('/student/directory');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Staff Directory');
  });

  test('boundary partition: searching a keyword with no matches shows "no matches found"', async () => {
    const res = await studentAgent.get('/student/search?keyword=zzzznomatch');
    expect(res.text).toContain('No matches found');
  });

  test('invalid partition: a student cannot access staff-only routes', async () => {
    const res = await studentAgent.post('/staff/areas').type('form').send({ name: 'Should Fail', description: '' });
    expect(res.status).toBe(403);
  });
});