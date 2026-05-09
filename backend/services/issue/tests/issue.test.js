const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock database connection
jest.mock('../src/config/database', () => ({
  connectDB: jest.fn()
}));

// Mock fetchUser helper
jest.mock('../src/utils/helpers', () => ({
  fetchUser: jest.fn()
}));

// Mock Issue model
jest.mock('../src/models/Issue', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
}));

const Issue = require('../src/models/Issue');
const { fetchUser } = require('../src/utils/helpers');
const app = require('../src/index');

const generateToken = (userId = 'user-123') => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret');
};

describe('Issue Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /issues', () => {
    it('should get all issues', async () => {
      const mockIssues = [
        {
          id: 'issue-1',
          title: 'Bug A',
          description: 'Desc A',
          status: 'open',
          priority: 'high',
          createdById: 'user-1',
          assignedToId: 'user-2',
          toJSON: () => ({
            id: 'issue-1',
            title: 'Bug A',
            description: 'Desc A',
            status: 'open',
            priority: 'high',
            createdById: 'user-1',
            assignedToId: 'user-2'
          })
        }
      ];
      Issue.findAll.mockResolvedValue(mockIssues);
      fetchUser.mockResolvedValue({ id: 'user-1', name: 'Alice' });

      const response = await request(app)
        .get('/issues');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should filter issues by status', async () => {
      const mockIssues = [
        {
          id: 'issue-1',
          title: 'Bug A',
          status: 'open',
          priority: 'high',
          createdById: 'user-1',
          toJSON: () => ({
            id: 'issue-1',
            title: 'Bug A',
            status: 'open',
            priority: 'high',
            createdById: 'user-1'
          })
        }
      ];
      Issue.findAll.mockResolvedValue(mockIssues);
      fetchUser.mockResolvedValue({ id: 'user-1', name: 'Alice' });

      const response = await request(app)
        .get('/issues?status=open');

      expect(response.status).toBe(200);
      expect(Issue.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: 'open' },
          order: [['createdAt', 'DESC']]
        })
      );
    });

    it('should filter issues by priority', async () => {
      const mockIssues = [];
      Issue.findAll.mockResolvedValue(mockIssues);

      const response = await request(app)
        .get('/issues?priority=critical');

      expect(response.status).toBe(200);
      expect(Issue.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { priority: 'critical' }
        })
      );
    });

    it('should handle empty issues list', async () => {
      Issue.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/issues');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('GET /issues/:id', () => {
    it('should get a single issue by id', async () => {
      const mockIssue = {
        id: 'issue-1',
        title: 'Bug A',
        description: 'Desc A',
        status: 'open',
        createdById: 'user-1',
        assignedToId: 'user-2',
        toJSON: () => ({
          id: 'issue-1',
          title: 'Bug A',
          description: 'Desc A',
          status: 'open',
          createdById: 'user-1',
          assignedToId: 'user-2'
        })
      };
      Issue.findByPk.mockResolvedValue(mockIssue);
      fetchUser.mockResolvedValue({ id: 'user-1', name: 'Alice' });

      const response = await request(app)
        .get('/issues/issue-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('issue-1');
    });

    it('should return 404 for non-existent issue', async () => {
      Issue.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get('/issues/nonexistent-id');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Issue not found');
    });
  });

  describe('POST /issues', () => {
    it('should create a new issue', async () => {
      const mockIssue = {
        id: 'issue-new',
        title: 'New Bug',
        description: 'New Desc',
        priority: 'high',
        status: 'open',
        createdById: 'user-123'
      };
      Issue.create.mockResolvedValue(mockIssue);

      const token = generateToken('user-123');
      const response = await request(app)
        .post('/issues')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'New Bug',
          description: 'New Desc',
          priority: 'high'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('New Bug');
    });

    it('should create issue with all fields', async () => {
      const mockIssue = {
        id: 'issue-new',
        title: 'Complete Bug',
        description: 'Complete Desc',
        priority: 'critical',
        status: 'open',
        category: 'bug',
        tags: ['urgent', 'frontend'],
        dueDate: '2024-12-31',
        assignedToId: 'user-2',
        createdById: 'user-123'
      };
      Issue.create.mockResolvedValue(mockIssue);

      const token = generateToken('user-123');
      const response = await request(app)
        .post('/issues')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Complete Bug',
          description: 'Complete Desc',
          priority: 'critical',
          category: 'bug',
          tags: ['urgent', 'frontend'],
          dueDate: '2024-12-31',
          assignedToId: 'user-2'
        });

      expect(response.status).toBe(201);
      expect(Issue.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Complete Bug',
          category: 'bug',
          tags: ['urgent', 'frontend']
        })
      );
    });
  });

  describe('PUT /issues/:id', () => {
    it('should update issue status', async () => {
      const mockIssue = {
        id: 'issue-1',
        title: 'Bug A',
        status: 'open',
        update: jest.fn().mockResolvedValue(true)
      };
      Issue.findByPk.mockResolvedValue(mockIssue);

      const token = generateToken();
      const response = await request(app)
        .put('/issues/issue-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'resolved' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockIssue.update).toHaveBeenCalledWith({ status: 'resolved' });
    });

    it('should update issue assignment', async () => {
      const mockIssue = {
        id: 'issue-1',
        title: 'Bug A',
        assignedToId: null,
        update: jest.fn().mockResolvedValue(true)
      };
      Issue.findByPk.mockResolvedValue(mockIssue);

      const token = generateToken();
      const response = await request(app)
        .put('/issues/issue-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ assignedToId: 'user-2' });

      expect(response.status).toBe(200);
      expect(mockIssue.update).toHaveBeenCalledWith({ assignedToId: 'user-2' });
    });

    it('should return 404 for non-existent issue', async () => {
      Issue.findByPk.mockResolvedValue(null);

      const token = generateToken();
      const response = await request(app)
        .put('/issues/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'resolved' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Issue not found');
    });
  });

  describe('DELETE /issues/:id', () => {
    it('should delete an issue', async () => {
      const mockIssue = {
        id: 'issue-1',
        title: 'Bug A',
        destroy: jest.fn().mockResolvedValue(true)
      };
      Issue.findByPk.mockResolvedValue(mockIssue);

      const token = generateToken();
      const response = await request(app)
        .delete('/issues/issue-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Issue deleted successfully');
    });

    it('should return 404 when deleting non-existent issue', async () => {
      Issue.findByPk.mockResolvedValue(null);

      const token = generateToken();
      const response = await request(app)
        .delete('/issues/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Issue not found');
    });
  });
});
