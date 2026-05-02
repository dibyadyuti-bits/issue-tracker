exports.formatResponse = (success, message, data = null, statusCode = 200) => {
  return {
    success,
    statusCode,
    message,
    data
  };
};

exports.handleError = (error) => {
  console.error('Error:', error);
  return {
    success: false,
    statusCode: error.statusCode || 500,
    message: error.message || 'Internal Server Error'
  };
};

exports.generateToken = (id, secret, expiresIn) => {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ id }, secret, { expiresIn });
};
