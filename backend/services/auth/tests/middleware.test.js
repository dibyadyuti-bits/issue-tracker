const jwt = require('jsonwebtoken');

// Mock User model
jest.mock('../src/models/User', () => ({
  findByPk: jest.fn(),
  findOne: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn()
}));

const User = require('../src/models/User');
const { protect, authorize } = require('../src/middleware/auth');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('protect', () => {
    it('should call next() with valid token', async () => {
      const mockUser = { id: 'user-123', name: 'Test User', role: 'user' };
      User.findByPk.mockResolvedValue(mockUser);

      const token = jwt.sign({ id: 'user-123' }, process.env.JWT_SECRET || 'test-secret');
      req.headers.authorization = `Bearer ${token}`;

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toEqual(mockUser);
    });

    it('should return 401 when no token provided', async () => {
      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', async () => {
      req.headers.authorization = 'Basic abc123';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });

    it('should return 401 when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await protect(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Not authorized' });
    });

    it('should call next when user not found in database (req.user = null)', async () => {
      User.findByPk.mockResolvedValue(null);

      const token = jwt.sign({ id: 'nonexistent-user' }, process.env.JWT_SECRET || 'test-secret');
      req.headers.authorization = `Bearer ${token}`;

      await protect(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.user).toBeNull();
    });
  });

  describe('authorize', () => {
    it('should call next() when user has required role', () => {
      req.user = { role: 'admin' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 403 when user does not have required role', () => {
      req.user = { role: 'user' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'User role not authorized' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow multiple roles', () => {
      req.user = { role: 'user' };
      const middleware = authorize('admin', 'user');

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });
});
