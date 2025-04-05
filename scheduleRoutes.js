const express = require('express');
const router = express.Router();
const { 
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  adaptSchedule
} = require('../controllers/scheduleController');
const { protect, tenantIsolation } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
router.use(tenantIsolation);

router.route('/')
  .post(createSchedule)
  .get(getSchedules);

router.route('/:id')
  .get(getSchedule)
  .put(updateSchedule)
  .delete(deleteSchedule);

router.put('/:id/adapt', adaptSchedule);

module.exports = router;
