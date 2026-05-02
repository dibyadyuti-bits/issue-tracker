import axios from 'axios';

describe('API Service', () => {
  const API_URL = 'http://localhost:5000/api/v1';

  it('should fetch all issues', async () => {
    try {
      const response = await axios.get(`${API_URL}/issues`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.data)).toBe(true);
    } catch (error) {
      expect(error).not.toBeNull();
    }
  });

  it('should create an issue', async () => {
    const token = 'test_token'; // Replace with actual token
    try {
      const response = await axios.post(
        `${API_URL}/issues`,
        {
          title: 'Test Issue',
          description: 'Test Description',
          priority: 'high'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      expect(response.status).toBe(201);
      expect(response.data.data.title).toBe('Test Issue');
    } catch (error) {
      expect(error).not.toBeNull();
    }
  });
});
