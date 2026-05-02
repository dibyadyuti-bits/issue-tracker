const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB } = require('./config/database');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));

connectDB();

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Comment Service is running' });
});

app.use('/comments', require('./routes/commentRoutes'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`Comment Service running on port ${PORT}`);
});

module.exports = app;
