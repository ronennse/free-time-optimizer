const express = require('express');
const router = express.Router();
const { 
  createFreeTimeSlot,
  getFreeTimeSlots,
  getFreeTimeSlot,
  deleteFreeTimeSlot,
  getSuggestions
} = require('../controllers/freeTimeController');
const { protect, tenantIsolation } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
router.use(tenantIsolation);

router.route('/')
  .post(createFreeTimeSlot)
  .get(getFreeTimeSlots);

router.route('/:id')
  .get(getFreeTimeSlot)
  .delete(deleteFreeTimeSlot);

router.get('/:id/suggestions', getSuggestions);

module.exports = router;
