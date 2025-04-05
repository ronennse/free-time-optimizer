const express = require('express');
const router = express.Router();
const { 
  getAuthUrl,
  handleCallback,
  disconnectCalendar,
  getFreeTimeSlots,
  createCalendarEvent
} = require('../controllers/calendarController');
const { protect, tenantIsolation } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
router.use(tenantIsolation);

// Google OAuth routes
router.get('/auth-url', getAuthUrl);
router.get('/callback', handleCallback);
router.delete('/disconnect', disconnectCalendar);

// Free time and event management
router.get('/free-time', getFreeTimeSlots);
router.post('/events', createCalendarEvent);

module.exports = router;
