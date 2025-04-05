const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// API routes
app.get('/api', (req, res) => {
  res.json({ message: 'API is running...' });
});

// Define routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/activities', require('./routes/activityRoutes'));
app.use('/api/freetime', require('./routes/freeTimeRoutes'));
app.use('/api/schedules', require('./routes/scheduleRoutes'));
app.use('/api/calendar', require('./routes/calendarRoutes'));
app.use('/api/suggestions', require('./routes/suggestionRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Any route that is not an API route will be redirected to index.html
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
} else {
  // For development, serve a simple welcome page
  app.get('/', (req, res) => {
    res.send(`
      <h1>Free Time Optimizer API</h1>
      <p>API is running. Access endpoints at /api/...</p>
      <p>For the full application experience, the frontend needs to be built or served separately.</p>
    `);
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
