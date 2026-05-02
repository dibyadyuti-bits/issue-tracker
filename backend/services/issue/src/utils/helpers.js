const axios = require('axios');

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';

exports.fetchUser = async (userId, token) => {
  try {
    const response = await axios.get(`${AUTH_SERVICE_URL}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  } catch (error) {
    return null;
  }
};

exports.formatResponse = (success, message, data = null, statusCode = 200) => {
  return { success, statusCode, message, data };
};
