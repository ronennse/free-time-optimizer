const FreeTimeSlot = require('../models/FreeTimeSlot');
const User = require('../models/User');
const Activity = require('../models/Activity');

// @desc    Create a new free time slot
// @route   POST /api/freetime
// @access  Private
const createFreeTimeSlot = async (req, res) => {
  try {
    const { start, end, source } = req.body;
    
    // Calculate duration in minutes
    const startDate = new Date(start);
    const endDate = new Date(end);
    const durationMinutes = Math.round((endDate - startDate) / (1000 * 60));
    
    if (durationMinutes <= 0) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const freeTimeSlot = await FreeTimeSlot.create({
      user: req.user.id,
      tenantId: user.tenantId,
      start: startDate,
      end: endDate,
      duration: durationMinutes,
      source: source || 'manual'
    });

    res.status(201).json(freeTimeSlot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all free time slots for a user
// @route   GET /api/freetime
// @access  Private
const getFreeTimeSlots = async (req, res) => {
  try {
    const freeTimeSlots = await FreeTimeSlot.find({ user: req.user.id })
      .sort({ start: 1 });
    res.json(freeTimeSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get a single free time slot
// @route   GET /api/freetime/:id
// @access  Private
const getFreeTimeSlot = async (req, res) => {
  try {
    const freeTimeSlot = await FreeTimeSlot.findById(req.params.id);

    if (!freeTimeSlot) {
      return res.status(404).json({ message: 'Free time slot not found' });
    }

    // Check if the free time slot belongs to the user
    if (freeTimeSlot.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.json(freeTimeSlot);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a free time slot
// @route   DELETE /api/freetime/:id
// @access  Private
const deleteFreeTimeSlot = async (req, res) => {
  try {
    const freeTimeSlot = await FreeTimeSlot.findById(req.params.id);

    if (!freeTimeSlot) {
      return res.status(404).json({ message: 'Free time slot not found' });
    }

    // Check if the free time slot belongs to the user
    if (freeTimeSlot.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await freeTimeSlot.remove();
    res.json({ message: 'Free time slot removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get activity suggestions for a free time slot
// @route   GET /api/freetime/:id/suggestions
// @access  Private
const getSuggestions = async (req, res) => {
  try {
    const freeTimeSlot = await FreeTimeSlot.findById(req.params.id);

    if (!freeTimeSlot) {
      return res.status(404).json({ message: 'Free time slot not found' });
    }

    // Check if the free time slot belongs to the user
    if (freeTimeSlot.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Get user's activities
    const activities = await Activity.find({ user: req.user.id });
    
    // Simple suggestion algorithm based on duration and time of day
    // This would be replaced with a more sophisticated algorithm in the activity suggestion engine
    const timeOfDay = getTimeOfDay(new Date(freeTimeSlot.start));
    const suggestions = activities
      .filter(activity => activity.duration <= freeTimeSlot.duration)
      .map(activity => {
        let score = 100;
        
        // Adjust score based on preferred time of day
        if (activity.preferredTimeOfDay === 'Any' || activity.preferredTimeOfDay === timeOfDay) {
          score += 20;
        }
        
        // Adjust score based on priority
        if (activity.priority === 'High') {
          score += 30;
        } else if (activity.priority === 'Medium') {
          score += 15;
        }
        
        // Adjust score based on how recently it was scheduled
        if (activity.lastScheduled) {
          const daysSinceLastScheduled = Math.floor((Date.now() - new Date(activity.lastScheduled)) / (1000 * 60 * 60 * 24));
          score += Math.min(daysSinceLastScheduled * 2, 30); // Max bonus of 30 points
        } else {
          score += 30; // Bonus for never scheduled activities
        }
        
        return {
          activity: activity._id,
          score,
          reason: `Fits within available time (${activity.duration} min)`
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5); // Return top 5 suggestions
    
    // Update the free time slot with suggestions
    freeTimeSlot.suggestedActivities = suggestions;
    freeTimeSlot.isProcessed = true;
    await freeTimeSlot.save();
    
    // Return the suggestions with full activity details
    const populatedFreeTimeSlot = await FreeTimeSlot.findById(req.params.id)
      .populate('suggestedActivities.activity');
    
    res.json(populatedFreeTimeSlot.suggestedActivities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper function to determine time of day
const getTimeOfDay = (date) => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return 'Morning';
  } else if (hours >= 12 && hours < 17) {
    return 'Afternoon';
  } else {
    return 'Evening';
  }
};

module.exports = {
  createFreeTimeSlot,
  getFreeTimeSlots,
  getFreeTimeSlot,
  deleteFreeTimeSlot,
  getSuggestions
};
