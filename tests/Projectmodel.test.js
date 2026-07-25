process.env.DB_FILE = 'test_project.db';
const db = require('../db/database');
const { resetDatabase } = require('./testUtils');
const userModel = require('../models/userModel');
const areaModel = require('../models/areaModel');
const projectModel = require('../models/projectModel');

let staffId, areaId;

beforeAll(async () => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  await resetDatabase(db);
  staffId = await userModel.create({
    name: 'Dr Project Owner',
    email: 'projectowner@test.edu',
    password: 'hashedvalue',
    role: 'staff'
  });
  areaId = await areaModel.create(staffId, 'Software Maintenance', 'Legacy systems');
});

describe('projectModel.create + findByStaff', () => {
  test('valid partition: creates a project linked to an area', async () => {
    const id = await projectModel.create(staffId, areaId, 'Refactoring Tool', 'A tool to detect code smells');
    expect(id).toBeGreaterThan(0);

    const projects = await projectModel.findByStaff(staffId);
    const created = projects.find(p => p.id === id);
    expect(created.area_name).toBe('Software Maintenance');
  });

  test('boundary partition: creates a project with no linked area (nullable field)', async () => {
    const id = await projectModel.create(staffId, null, 'Standalone Idea', 'No specific area');
    const found = await projectModel.findById(id);
    expect(found.area_id).toBeNull();
  });
});

describe('projectModel.update', () => {
  test('valid partition: updates title, description, and re-links the area', async () => {
    const id = await projectModel.create(staffId, areaId, 'Old Title', 'Old desc');
    await projectModel.update(id, 'New Title', 'New desc', areaId);
    const found = await projectModel.findById(id);
    expect(found.title).toBe('New Title');
  });
});

describe('projectModel.remove', () => {
  test('valid partition: deletes a project so findById returns undefined', async () => {
    const id = await projectModel.create(staffId, areaId, 'To Delete', 'desc');
    await projectModel.remove(id);
    const found = await projectModel.findById(id);
    expect(found).toBeUndefined();
  });
});

describe('projectModel.search', () => {
  test('valid partition: keyword matching an existing title returns that project', async () => {
    await projectModel.create(staffId, areaId, 'Unique Search Target', 'desc');
    const results = await projectModel.search('Unique Search Target', null);
    expect(results.some(p => p.title === 'Unique Search Target')).toBe(true);
  });

  test('boundary partition: keyword with no matches returns an empty array', async () => {
    const results = await projectModel.search('zzzznomatchkeyword', null);
    expect(results).toEqual([]);
  });

  test('valid partition: filtering by area_id only returns projects linked to that area', async () => {
    const otherAreaId = await areaModel.create(staffId, 'Data Analysis', 'desc');
    await projectModel.create(staffId, otherAreaId, 'Analysis Project', 'desc');

    const results = await projectModel.search(null, otherAreaId);
    expect(results.every(p => p.area_id === otherAreaId)).toBe(true);
    expect(results.some(p => p.title === 'Analysis Project')).toBe(true);
  });
});