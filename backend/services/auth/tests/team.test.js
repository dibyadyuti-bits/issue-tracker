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
const Team = require('../src/models/Team');
const app = require('../src/index');

const generateAdminToken = () => {
  return jwt.sign({ id: 'admin-123', role: 'admin' }, process.env.JWT_SECRET || 'test-secret');
};

describe('Team Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /teams', () => {
    it('should get all teams with members', async () => {
      const mockTeams = [
        {
          id: 'team-1',
          name: 'Engineering',
          description: 'Dev team',
          members: [
            { id: 'user-1', name: 'Alice', email: 'alice@example.com' }
          ]
        }
      ];
      Team.findAll.mockResolvedValue(mockTeams);

      const token = generateAdminToken();
      const response = await request(app)
        .get('/teams')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.count).toBe(1);
    });

    it('should handle empty teams list', async () => {
      Team.findAll.mockResolvedValue([]);

      const token = generateAdminToken();
      const response = await request(app)
        .get('/teams')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  describe('GET /teams/:id', () => {
    it('should get a single team with members', async () => {
      const mockTeam = {
        id: 'team-1',
        name: 'Engineering',
        description: 'Dev team',
        members: [
          { id: 'user-1', name: 'Alice', email: 'alice@example.com' }
        ]
      };
      Team.findByPk.mockResolvedValue(mockTeam);

      const token = generateAdminToken();
      const response = await request(app)
        .get('/teams/team-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('team-1');
    });

    it('should return 404 for non-existent team', async () => {
      Team.findByPk.mockResolvedValue(null);

      const token = generateAdminToken();
      const response = await request(app)
        .get('/teams/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('POST /teams', () => {
    it('should create a new team as admin', async () => {
      const mockTeam = {
        id: 'team-new',
        name: 'QA Team',
        description: 'Quality assurance'
      };
      Team.create.mockResolvedValue(mockTeam);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .post('/teams')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'QA Team',
          description: 'Quality assurance'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('QA Team');
    });
  });

  describe('PUT /teams/:id', () => {
    it('should update team as admin', async () => {
      const mockTeam = {
        id: 'team-1',
        name: 'Engineering',
        description: 'Old description',
        save: jest.fn().mockResolvedValue(true)
      };
      Team.findByPk.mockResolvedValue(mockTeam);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/teams/team-1')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'New description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 when updating non-existent team', async () => {
      Team.findByPk.mockResolvedValue(null);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/teams/nonexistent-id')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'New Name' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('DELETE /teams/:id', () => {
    it('should delete team and remove user associations', async () => {
      const mockTeam = {
        id: 'team-1',
        name: 'Engineering',
        destroy: jest.fn().mockResolvedValue(true)
      };
      Team.findByPk.mockResolvedValue(mockTeam);
      User.update.mockResolvedValue([1]);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .delete('/teams/team-1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(User.update).toHaveBeenCalledWith(
        { teamId: null },
        { where: { teamId: 'team-1' } }
      );
    });

    it('should return 404 when deleting non-existent team', async () => {
      Team.findByPk.mockResolvedValue(null);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .delete('/teams/nonexistent-id')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });
  });

  describe('PUT /teams/:id/assign', () => {
    it('should assign user to team', async () => {
      const mockTeam = { id: 'team-1', name: 'Engineering' };
      const mockUser = {
        id: 'user-1',
        name: 'Alice',
        teamId: null,
        save: jest.fn().mockResolvedValue(true)
      };
      Team.findByPk.mockResolvedValue(mockTeam);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        if (id === 'user-1') return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/teams/team-1/assign')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'user-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.teamId).toBe('team-1');
    });

    it('should return 404 for non-existent team', async () => {
      Team.findByPk.mockResolvedValue(null);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/teams/nonexistent-id/assign')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'user-1' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Team not found');
    });

    it('should return 404 for non-existent user', async () => {
      const mockTeam = { id: 'team-1', name: 'Engineering' };
      Team.findByPk.mockResolvedValue(mockTeam);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/teams/team-1/assign')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'nonexistent-user' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PUT /teams/:id/remove', () => {
    it('should remove user from team', async () => {
      const mockTeam = { id: 'team-1', name: 'Engineering' };
      const mockUser = {
        id: 'user-1',
        name: 'Alice',
        teamId: 'team-1',
        save: jest.fn().mockResolvedValue(true)
      };
      Team.findByPk.mockResolvedValue(mockTeam);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        if (id === 'user-1') return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/teams/team-1/remove')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'user-1' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockUser.teamId).toBeNull();
    });

    it('should return 400 when user is not in team', async () => {
      const mockTeam = { id: 'team-1', name: 'Engineering' };
      const mockUser = {
        id: 'user-1',
        name: 'Alice',
        teamId: 'different-team-id',
        save: jest.fn().mockResolvedValue(true)
      };
      Team.findByPk.mockResolvedValue(mockTeam);
      User.findByPk.mockImplementation((id) => {
        if (id === 'admin-123') return Promise.resolve({ id: 'admin-123', role: 'admin' });
        if (id === 'user-1') return Promise.resolve(mockUser);
        return Promise.resolve(null);
      });

      const token = generateAdminToken();
      const response = await request(app)
        .put('/teams/team-1/remove')
        .set('Authorization', `Bearer ${token}`)
        .send({ userId: 'user-1' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User is not in this team');
    });
  });
});
