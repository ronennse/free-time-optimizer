const express = require('express');
const router = express.Router();
const { 
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  completeActivity
} = require('../controllers/activityController');
const { protect, tenantIsolation } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);
router.use(tenantIsolation);

router.route('/')
  .post(createActivity)
  .get(getActivities);

router.route('/:id')
  .get(getActivity)
  .put(updateActivity)
  .delete(deleteActivity);

router.post('/:id/complete', completeActivity);

module.exports = router;
