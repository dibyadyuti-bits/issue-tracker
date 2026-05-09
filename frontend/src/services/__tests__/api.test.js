jest.mock('axios', () => {
  const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn()
      }
    }
  };
  return {
    create: jest.fn(() => mockClient),
    default: {
      create: jest.fn(() => mockClient)
    }
  };
});

import axios from 'axios';

const mockClient = axios.create();

import {
  authService,
  issueService,
  userService,
  teamService,
  commentService
} from '../api';

describe('API Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.create.mockReturnValue(mockClient);
  });

  describe('Auth Service', () => {
    it('should call register endpoint', async () => {
      const mockResponse = { data: { success: true, token: 'abc123' } };
      mockClient.post.mockResolvedValue(mockResponse);

      const result = await authService.register('Test User', 'test@example.com', 'password123');

      expect(mockClient.post).toHaveBeenCalledWith('/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should call login endpoint', async () => {
      const mockResponse = { data: { success: true, token: 'abc123' } };
      mockClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password123');

      expect(mockClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123'
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Issue Service', () => {
    it('should call getAllIssues endpoint', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await issueService.getAllIssues();

      expect(mockClient.get).toHaveBeenCalledWith('/issues');
      expect(result).toEqual(mockResponse);
    });

    it('should call getIssueById endpoint', async () => {
      const mockResponse = { data: { success: true, data: { id: 'issue-1' } } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await issueService.getIssueById('issue-1');

      expect(mockClient.get).toHaveBeenCalledWith('/issues/issue-1');
      expect(result).toEqual(mockResponse);
    });

    it('should call createIssue endpoint', async () => {
      const issueData = {
        title: 'New Issue',
        description: 'Issue description',
        priority: 'high'
      };
      const mockResponse = { data: { success: true, data: issueData } };
      mockClient.post.mockResolvedValue(mockResponse);

      const result = await issueService.createIssue(issueData);

      expect(mockClient.post).toHaveBeenCalledWith('/issues', issueData);
      expect(result).toEqual(mockResponse);
    });

    it('should call updateIssue endpoint', async () => {
      const updateData = { status: 'resolved' };
      const mockResponse = { data: { success: true } };
      mockClient.put.mockResolvedValue(mockResponse);

      const result = await issueService.updateIssue('issue-1', updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/issues/issue-1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should call deleteIssue endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await issueService.deleteIssue('issue-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/issues/issue-1');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('User Service', () => {
    it('should call getAllUsers endpoint', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await userService.getAllUsers();

      expect(mockClient.get).toHaveBeenCalledWith('/users');
      expect(result).toEqual(mockResponse);
    });

    it('should call updateUser endpoint', async () => {
      const updateData = { role: 'admin' };
      const mockResponse = { data: { success: true } };
      mockClient.put.mockResolvedValue(mockResponse);

      const result = await userService.updateUser('user-1', updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/users/user-1', updateData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Team Service', () => {
    it('should call getAllTeams endpoint', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await teamService.getAllTeams();

      expect(mockClient.get).toHaveBeenCalledWith('/teams');
      expect(result).toEqual(mockResponse);
    });

    it('should call getTeam endpoint', async () => {
      const mockResponse = { data: { success: true, data: { id: 'team-1' } } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await teamService.getTeam('team-1');

      expect(mockClient.get).toHaveBeenCalledWith('/teams/team-1');
      expect(result).toEqual(mockResponse);
    });

    it('should call createTeam endpoint', async () => {
      const teamData = { name: 'Engineering', description: 'Dev team' };
      const mockResponse = { data: { success: true } };
      mockClient.post.mockResolvedValue(mockResponse);

      const result = await teamService.createTeam(teamData);

      expect(mockClient.post).toHaveBeenCalledWith('/teams', teamData);
      expect(result).toEqual(mockResponse);
    });

    it('should call updateTeam endpoint', async () => {
      const updateData = { name: 'New Name' };
      const mockResponse = { data: { success: true } };
      mockClient.put.mockResolvedValue(mockResponse);

      const result = await teamService.updateTeam('team-1', updateData);

      expect(mockClient.put).toHaveBeenCalledWith('/teams/team-1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should call deleteTeam endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await teamService.deleteTeam('team-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/teams/team-1');
      expect(result).toEqual(mockResponse);
    });

    it('should call assignUser endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockClient.put.mockResolvedValue(mockResponse);

      const result = await teamService.assignUser('team-1', 'user-1');

      expect(mockClient.put).toHaveBeenCalledWith('/teams/team-1/assign', { userId: 'user-1' });
      expect(result).toEqual(mockResponse);
    });

    it('should call removeUser endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockClient.put.mockResolvedValue(mockResponse);

      const result = await teamService.removeUser('team-1', 'user-1');

      expect(mockClient.put).toHaveBeenCalledWith('/teams/team-1/remove', { userId: 'user-1' });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Comment Service', () => {
    it('should call getComments endpoint', async () => {
      const mockResponse = { data: { success: true, data: [] } };
      mockClient.get.mockResolvedValue(mockResponse);

      const result = await commentService.getComments('issue-1');

      expect(mockClient.get).toHaveBeenCalledWith('/comments/issue/issue-1');
      expect(result).toEqual(mockResponse);
    });

    it('should call addComment endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockClient.post.mockResolvedValue(mockResponse);

      const result = await commentService.addComment('issue-1', 'New comment');

      expect(mockClient.post).toHaveBeenCalledWith('/comments/issue/issue-1', { text: 'New comment' });
      expect(result).toEqual(mockResponse);
    });

    it('should call deleteComment endpoint', async () => {
      const mockResponse = { data: { success: true } };
      mockClient.delete.mockResolvedValue(mockResponse);

      const result = await commentService.deleteComment('comment-1');

      expect(mockClient.delete).toHaveBeenCalledWith('/comments/comment-1');
      expect(result).toEqual(mockResponse);
    });
  });
});
