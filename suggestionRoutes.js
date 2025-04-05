const express = require('express');
const router = express.Router();
const { 
  generateSuggestions,
  getSuggestionsByDuration,
  adaptActivity
} = require('../controllers/suggestionController');
const { protect, tenantIsolation } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
router.use(tenantIsolation);

// Generate suggestions for a specific free time slot
router.post('/', generateSuggestions);

// Get suggestions based on duration
router.post('/duration', getSuggestionsByDuration);

// Adapt an activity to fit a shorter time slot
router.post('/adapt', adaptActivity);

module.exports = router;
