process.env.DB_FILE = 'test_area.db';
const db = require('../db/database');
const { resetDatabase } = require('./testUtils');
const userModel = require('../models/userModel');
const areaModel = require('../models/areaModel');

let staffId;

beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  await resetDatabase(db);
  staffId = await userModel.create({
    name: 'Dr Test Staff',
    email: 'teststaff@test.edu',
    password: 'hashedvalue',
    role: 'staff'
  });
});

describe('areaModel.create + findByStaff', () => {
  test('valid partition: creates an area and it appears under the owning staff member', async () => {
    await areaModel.create(staffId, 'Graph Theory', 'Algorithms on graphs and networks');
    const areas = await areaModel.findByStaff(staffId);
    expect(areas.some(a => a.name === 'Graph Theory')).toBe(true);
  });

  test('boundary partition: a staff member with no areas returns an empty array', async () => {
    const newStaffId = await userModel.create({
      name: 'Dr No Areas',
      email: 'noareas@test.edu',
      password: 'hashedvalue',
      role: 'staff'
    });
    const areas = await areaModel.findByStaff(newStaffId);
    expect(areas).toEqual([]);
  });
});

describe('areaModel.update', () => {
  test('valid partition: updates the name and description of an existing area', async () => {
    const areaId = await areaModel.create(staffId, 'Old Name', 'Old description');
    await areaModel.update(areaId, 'Updated Name', 'Updated description');
    const found = await areaModel.findById(areaId);
    expect(found.name).toBe('Updated Name');
    expect(found.description).toBe('Updated description');
  });
});

describe('areaModel.remove', () => {
  test('valid partition: deletes an area so it no longer appears for that staff member', async () => {
    const areaId = await areaModel.create(staffId, 'Temporary Area', 'To be deleted');
    await areaModel.remove(areaId);
    const found = await areaModel.findById(areaId);
    expect(found).toBeUndefined();
  });

  test('invalid partition: removing a non-existent id does not throw', async () => {
    await expect(areaModel.remove(999999)).resolves.not.toThrow();
  });
});

describe('areaModel.findById (ownership check support)', () => {
  test('valid partition: returns the correct staff_id for an owned area', async () => {
    const areaId = await areaModel.create(staffId, 'Ownership Check', 'desc');
    const found = await areaModel.findById(areaId);
    expect(found.staff_id).toBe(staffId);
  });
});