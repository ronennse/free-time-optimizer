const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Create a new activity
// @route   POST /api/activities
// @access  Private
const createActivity = async (req, res) => {
  try {
    const { title, type, duration, preferredTimeOfDay, priority, customPriorityRules } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const activity = await Activity.create({
      user: req.user.id,
      tenantId: user.tenantId,
      title,
      type,
      duration,
      preferredTimeOfDay,
      priority,
      customPriorityRules
    });

    res.status(201).json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all activities for a user
// @route   GET /api/activities
// @access  Private
const getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id });
    res.json(activities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single activity
// @route   GET /api/activities/:id
// @access  Private
const getActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if the activity belongs to the user
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(activity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an activity
// @route   PUT /api/activities/:id
// @access  Private
const updateActivity = async (req, res) => {
  try {
    const { title, type, duration, preferredTimeOfDay, priority, customPriorityRules } = req.body;

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if the activity belongs to the user
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    activity.title = title || activity.title;
    activity.type = type || activity.type;
    activity.duration = duration || activity.duration;
    activity.preferredTimeOfDay = preferredTimeOfDay || activity.preferredTimeOfDay;
    activity.priority = priority || activity.priority;
    activity.customPriorityRules = customPriorityRules || activity.customPriorityRules;
    activity.updatedAt = Date.now();

    const updatedActivity = await activity.save();
    res.json(updatedActivity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an activity
// @route   DELETE /api/activities/:id
// @access  Private
const deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if the activity belongs to the user
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await activity.remove();
    res.json({ message: 'Activity removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update activity completion history
// @route   POST /api/activities/:id/complete
// @access  Private
const completeActivity = async (req, res) => {
  try {
    const { duration, completed } = req.body;

    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }

    // Check if the activity belongs to the user
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    activity.completionHistory.push({
      date: Date.now(),
      duration,
      completed
    });
    
    activity.lastScheduled = Date.now();
    activity.updatedAt = Date.now();

    const updatedActivity = await activity.save();
    res.json(updatedActivity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  completeActivity
};
