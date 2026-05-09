const request = require('supertest');
const jwt = require('jsonwebtoken');

// Mock database connection
jest.mock('../src/config/database', () => ({
  connectDB: jest.fn()
}));

// Mock Comment model
jest.mock('../src/models/Comment', () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  destroy: jest.fn()
}));

const Comment = require('../src/models/Comment');
const app = require('../src/index');

const generateToken = (userId = 'user-123') => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'test-secret');
};

describe('Comment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /comments/issue/:issueId', () => {
    it('should get all comments for an issue', async () => {
      const mockComments = [
        {
          id: 'comment-1',
          text: 'First comment',
          issueId: 'issue-1',
          userId: 'user-1',
          createdAt: '2024-05-01T10:00:00Z'
        },
        {
          id: 'comment-2',
          text: 'Second comment',
          issueId: 'issue-1',
          userId: 'user-2',
          createdAt: '2024-05-01T11:00:00Z'
        }
      ];
      Comment.findAll.mockResolvedValue(mockComments);

      const response = await request(app)
        .get('/comments/issue/issue-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(2);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(Comment.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { issueId: 'issue-1' },
          order: [['createdAt', 'ASC']]
        })
      );
    });

    it('should handle empty comments list', async () => {
      Comment.findAll.mockResolvedValue([]);

      const response = await request(app)
        .get('/comments/issue/issue-1');

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
      expect(response.body.data).toEqual([]);
    });
  });

  describe('POST /comments/issue/:issueId', () => {
    it('should add a comment to an issue', async () => {
      const mockComment = {
        id: 'comment-new',
        text: 'New comment',
        issueId: 'issue-1',
        userId: 'user-123',
        createdAt: '2024-05-01T12:00:00Z'
      };
      Comment.create.mockResolvedValue(mockComment);

      const token = generateToken('user-123');
      const response = await request(app)
        .post('/comments/issue/issue-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ text: 'New comment' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.text).toBe('New comment');
      expect(Comment.create).toHaveBeenCalledWith({
        text: 'New comment',
        issueId: 'issue-1',
        userId: 'user-123'
      });
    });

    it('should handle missing text field', async () => {
      Comment.create.mockRejectedValue(new Error('Validation error'));

      const token = generateToken('user-123');
      const response = await request(app)
        .post('/comments/issue/issue-1')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /comments/:id', () => {
    it('should delete a comment', async () => {
      const mockComment = {
        id: 'comment-1',
        text: 'Comment to delete',
        destroy: jest.fn().mockResolvedValue(true)
      };
      Comment.findByPk.mockResolvedValue(mockComment);

      const token = generateToken();
      const response = await request(app)
        .delete('/comments/comment-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Comment deleted successfully');
    });

    it('should return 404 when deleting non-existent comment', async () => {
      Comment.findByPk.mockResolvedValue(null);

      const token = generateToken();
      const response = await request(app)
        .delete('/comments/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Comment not found');
    });
  });
});
