const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock database connection
jest.mock('../src/config/database', () => ({
  connectDB: jest.fn()
}));

// Mock User model
jest.mock('../src/models/User', () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn()
}));

// Mock Team model
jest.mock('../src/models/Team', () => ({
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  hasMany: jest.fn(),
  belongsTo: jest.fn()
}));

const User = require('../src/models/User');
const app = require('../src/index');

// Helper to generate admin token
const generateAdminToken = () => {
  return jwt.sign({ id: 'admin-123', role: 'admin' }, process.env.JWT_SECRET || 'test-secret');
};

// Helper to generate user token
const generateUserToken = () => {
  return jwt.sign({ id: 'user-123', role: 'user' }, process.env.JWT_SECRET || 'test-secret');
};

describe('User Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should get all users', async () => {
      const mockUsers = [
        { id: 'user-1', name: 'Alice', email: 'alice@example.com', role: 'user' },
        { id: 'user-2', name: 'Bob', email: 'bob@example.com', role: 'admin' }
      ];
      User.findAll.mockResolvedValue(mockUsers);

      const token = generateAdminToken();
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should handle empty user list', async () => {
      User.findAll.mockResolvedValue([]);

      const token = generateAdminToken();
      const response = await request(app)
        .get('/users')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /users/:id', () => {
    it('should get a single user by id', async () => {
      const mockUser = { id: 'user-1', name: 'Alice', email: 'alice@example.com', role: 'user' };
      User.findByPk.mockImplementation((id) => {
        if (id === 'user-1') return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .get('/users/user-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('user-1');
    });

    it('should return 404 for non-existent user', async () => {
      User.findByPk.mockResolvedValue(null);

      const token = generateAdminToken();
      const response = await request(app)
        .get('/users/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user role as admin', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'user',
        teamId: null,
        save: jest.fn().mockResolvedValue(true)
      };
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        if (id === 'user-1') return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/users/user-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ role: 'admin' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should update user teamId as admin', async () => {
      const mockUser = {
        id: 'user-1',
        name: 'Alice',
        role: 'user',
        teamId: null,
        save: jest.fn().mockResolvedValue(true)
      };
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        if (id === 'user-1') return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/users/user-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ teamId: 'team-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent user on update', async () => {
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/users/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });
});
