process.env.DB_FILE = 'test_user.db';
const db = require('../db/database');
const { resetDatabase } = require('./testUtils');
const userModel = require('../models/userModel');

beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200)); // let schema.sql finish running
  await resetDatabase(db); // start every run from a clean, empty database
});

describe('userModel.create + findByEmail', () => {
  test('valid partition: creates a staff user and can find them by email', async () => {
    const id = await userModel.create({
      name: 'Dr Amina Khan',
      email: 'amina.khan@test.edu',
      password: 'hashedvalue123',
      role: 'staff'
    });
    expect(id).toBeGreaterThan(0);

    const found = await userModel.findByEmail('amina.khan@test.edu');
    expect(found).not.toBeUndefined();
    expect(found.role).toBe('staff');
  });

  test('invalid partition: email not in the system returns undefined', async () => {
    const result = await userModel.findByEmail('doesnotexist@test.edu');
    expect(result).toBeUndefined();
  });
});

describe('userModel.findById', () => {
  test('valid partition: returns correct user for a valid id', async () => {
    const id = await userModel.create({
      name: 'Sara Ali',
      email: 'sara.ali@test.edu',
      password: 'hashedvalue456',
      role: 'student'
    });
    const found = await userModel.findById(id);
    expect(found.name).toBe('Sara Ali');
  });

  test('invalid partition: non-existent id returns undefined', async () => {
    const found = await userModel.findById(999999);
    expect(found).toBeUndefined();
  });
});

describe('userModel.setCapacity', () => {
  test('valid partition: sets a positive capacity value for staff', async () => {
    const id = await userModel.create({
      name: 'Dr Bilal Ahmed',
      email: 'bilal.ahmed@test.edu',
      password: 'hashedvalue789',
      role: 'staff'
    });
    await userModel.setCapacity(id, 3);
    const found = await userModel.findById(id);
    expect(found.capacity).toBe(3);
  });

  test('boundary partition: capacity of 0 is accepted and stored', async () => {
    const id = await userModel.create({
      name: 'Dr Zara Malik',
      email: 'zara.malik@test.edu',
      password: 'hashedvalueabc',
      role: 'staff'
    });
    await userModel.setCapacity(id, 0);
    const found = await userModel.findById(id);
    expect(found.capacity).toBe(0);
  });
});

describe('userModel.getAllStaff + searchStaff', () => {
  test('valid partition: getAllStaff only returns users with role staff', async () => {
    const staff = await userModel.getAllStaff();
    expect(staff.every(u => u !== undefined)).toBe(true);
    expect(staff.some(u => u.name === 'Sara Ali')).toBe(false);
  });

  test('boundary partition: searching a keyword with no matches returns an empty array', async () => {
    const results = await userModel.searchStaff('zzzznomatch');
    expect(results).toEqual([]);
  });

  test('valid partition: searching a keyword matching a staff name returns that staff member', async () => {
    const results = await userModel.searchStaff('Amina');
    expect(results.some(u => u.name === 'Dr Amina Khan')).toBe(true);
  });
});