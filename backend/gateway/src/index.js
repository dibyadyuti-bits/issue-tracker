const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();
const { verifyToken } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

const API_PREFIX = process.env.API_PREFIX || '/api/v1';
const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:5001';
const ISSUE_URL = process.env.ISSUE_SERVICE_URL || 'http://localhost:5002';
const COMMENT_URL = process.env.COMMENT_SERVICE_URL || 'http://localhost:5003';

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'API Gateway is running',
    services: {
      auth: AUTH_URL,
      issue: ISSUE_URL,
      comment: COMMENT_URL
    }
  });
});

// Proxy middleware options with body forwarding
const proxyOptions = (target, rewritePath) => ({
  target,
  changeOrigin: true,
  pathRewrite: { [`^${API_PREFIX}${rewritePath}`]: rewritePath },
  onProxyReq: (proxyReq, req, res) => {
    if (req.user) {
      proxyReq.setHeader('x-user-id', req.user.id);
    }
    if (req.body) {
      const bodyData = JSON.stringify(req.body);
      proxyReq.setHeader('Content-Type', 'application/json');
      proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
      proxyReq.write(bodyData);
    }
  },
  onError: (err, req, res) => {
    console.error(`Proxy error to ${target}:`, err.message);
    res.status(503).json({ message: 'Service unavailable' });
  }
});

// Body parser middleware applied only to non-proxy routes
app.use('/health', express.json());
app.use('/health', express.urlencoded({ extended: true }));

// Public routes (no auth) - body parser applied per route
app.use(`${API_PREFIX}/auth`, express.json());
app.use(`${API_PREFIX}/auth`, express.urlencoded({ extended: true }));
app.use(`${API_PREFIX}/auth`, createProxyMiddleware(proxyOptions(AUTH_URL, '/auth')));

// Protected routes - body parser applied per route
app.use(`${API_PREFIX}/users`, express.json());
app.use(`${API_PREFIX}/users`, express.urlencoded({ extended: true }));
app.use(`${API_PREFIX}/users`, verifyToken, createProxyMiddleware(proxyOptions(AUTH_URL, '/users')));

app.use(`${API_PREFIX}/issues`, express.json());
app.use(`${API_PREFIX}/issues`, express.urlencoded({ extended: true }));
app.use(`${API_PREFIX}/issues`, createProxyMiddleware(proxyOptions(ISSUE_URL, '/issues')));

app.use(`${API_PREFIX}/comments`, express.json());
app.use(`${API_PREFIX}/comments`, express.urlencoded({ extended: true }));
app.use(`${API_PREFIX}/comments`, createProxyMiddleware(proxyOptions(COMMENT_URL, '/comments')));

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log(`Proxying to Auth (${AUTH_URL}), Issue (${ISSUE_URL}), Comment (${COMMENT_URL})`);
});

module.exports = app;
