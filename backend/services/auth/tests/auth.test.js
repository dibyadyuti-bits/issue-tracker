const request = require('supertest');

// Mock database connection before importing app
jest.mock('../src/config/database', () => ({
  connectDB: jest.fn()
}));

// Mock User model
jest.mock('../src/models/User', () => {
  const mockUsers = [];
  return {
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    hasMany: jest.fn(),
    belongsTo: jest.fn(),
    mockUsers
  };
});

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

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/register', () => {
    it('should register a new user with valid data', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeDefined();
    });

    it('should not register user with existing email', async () => {
      User.findOne.mockResolvedValue({
        id: 'existing-id',
        email: 'existing@example.com'
      });

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User',
          email: 'existing@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should handle missing fields gracefully', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockRejectedValue(new Error('Validation error'));

      const response = await request(app)
        .post('/auth/register')
        .send({
          name: 'Test User'
          // missing email and password
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /auth/login', () => {
    it('should login user with correct credentials', async () => {
      const mockUser = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: 'user',
        matchPassword: jest.fn().mockResolvedValue(true)
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Please provide email and password');
    });

    it('should reject login for non-existent user', async () => {
      User.findOne.mockResolvedValue(null);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject login with wrong password', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne.mockResolvedValue(mockUser);

      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});
