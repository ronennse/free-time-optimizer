const Schedule = require('../models/Schedule');
const FreeTimeSlot = require('../models/FreeTimeSlot');
const Activity = require('../models/Activity');
const User = require('../models/User');

// @desc    Create a new schedule
// @route   POST /api/schedules
// @access  Private
const createSchedule = async (req, res) => {
  try {
    const { activityId, freeTimeSlotId, start, end, duration } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify the activity belongs to the user
    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to use this activity' });
    }

    // If a free time slot is provided, verify it belongs to the user
    if (freeTimeSlotId) {
      const freeTimeSlot = await FreeTimeSlot.findById(freeTimeSlotId);
      if (!freeTimeSlot) {
        return res.status(404).json({ message: 'Free time slot not found' });
      }
      if (freeTimeSlot.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized to use this free time slot' });
      }
    }

    // Calculate duration if not provided
    let scheduleDuration = duration;
    if (!scheduleDuration && start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      scheduleDuration = Math.round((endDate - startDate) / (1000 * 60));
    }

    // Create the schedule
    const schedule = await Schedule.create({
      user: req.user.id,
      tenantId: user.tenantId,
      activity: activityId,
      freeTimeSlot: freeTimeSlotId || null,
      start: new Date(start),
      end: new Date(end),
      duration: scheduleDuration,
      originalDuration: activity.duration // Store original activity duration for adaptation tracking
    });

    // Update the activity's lastScheduled date
    activity.lastScheduled = Date.now();
    await activity.save();

    res.status(201).json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all schedules for a user
// @route   GET /api/schedules
// @access  Private
const getSchedules = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    
    // Build query
    const query = { user: req.user.id };
    
    // Add date range filter if provided
    if (startDate || endDate) {
      query.start = {};
      if (startDate) {
        query.start.$gte = new Date(startDate);
      }
      if (endDate) {
        query.start.$lte = new Date(endDate);
      }
    }
    
    // Add status filter if provided
    if (status) {
      query.status = status;
    }
    
    const schedules = await Schedule.find(query)
      .populate('activity')
      .sort({ start: 1 });
      
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single schedule
// @route   GET /api/schedules/:id
// @access  Private
const getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('activity')
      .populate('freeTimeSlot');

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if the schedule belongs to the user
    if (schedule.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(schedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a schedule
// @route   PUT /api/schedules/:id
// @access  Private
const updateSchedule = async (req, res) => {
  try {
    const { start, end, duration, status, adaptationReason } = req.body;

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if the schedule belongs to the user
    if (schedule.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Update fields
    if (start) schedule.start = new Date(start);
    if (end) schedule.end = new Date(end);
    
    // Calculate duration if start and end are provided but duration is not
    if (start && end && !duration) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      schedule.duration = Math.round((endDate - startDate) / (1000 * 60));
    } else if (duration) {
      schedule.duration = duration;
    }
    
    if (status) schedule.status = status;
    if (adaptationReason) schedule.adaptationReason = adaptationReason;
    
    // If status is changed to 'adapted', record the original duration if not already set
    if (status === 'adapted' && !schedule.originalDuration) {
      const activity = await Activity.findById(schedule.activity);
      if (activity) {
        schedule.originalDuration = activity.duration;
      }
    }
    
    // If status is changed to 'completed', update the activity's completion history
    if (status === 'completed') {
      const activity = await Activity.findById(schedule.activity);
      if (activity) {
        activity.completionHistory.push({
          date: Date.now(),
          duration: schedule.duration,
          completed: true
        });
        await activity.save();
      }
    }
    
    schedule.updatedAt = Date.now();
    const updatedSchedule = await schedule.save();
    
    res.json(updatedSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a schedule
// @route   DELETE /api/schedules/:id
// @access  Private
const deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if the schedule belongs to the user
    if (schedule.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await schedule.remove();
    res.json({ message: 'Schedule removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Adapt a schedule to a new time duration
// @route   PUT /api/schedules/:id/adapt
// @access  Private
const adaptSchedule = async (req, res) => {
  try {
    const { newDuration, newStart, newEnd, reason } = req.body;

    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({ message: 'Schedule not found' });
    }

    // Check if the schedule belongs to the user
    if (schedule.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Store original duration if not already set
    if (!schedule.originalDuration) {
      const activity = await Activity.findById(schedule.activity);
      if (activity) {
        schedule.originalDuration = activity.duration;
      } else {
        schedule.originalDuration = schedule.duration;
      }
    }

    // Update schedule with new timing
    if (newStart) schedule.start = new Date(newStart);
    if (newEnd) schedule.end = new Date(newEnd);
    
    // Calculate duration if start and end are provided but duration is not
    if (newStart && newEnd && !newDuration) {
      const startDate = new Date(newStart);
      const endDate = new Date(newEnd);
      schedule.duration = Math.round((endDate - startDate) / (1000 * 60));
    } else if (newDuration) {
      schedule.duration = newDuration;
    }
    
    schedule.status = 'adapted';
    schedule.adaptationReason = reason || 'Schedule adapted due to time constraints';
    schedule.updatedAt = Date.now();
    
    const updatedSchedule = await schedule.save();
    res.json(updatedSchedule);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createSchedule,
  getSchedules,
  getSchedule,
  updateSchedule,
  deleteSchedule,
  adaptSchedule
};
