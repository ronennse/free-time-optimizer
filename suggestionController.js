const Activity = require('../models/Activity');
const FreeTimeSlot = require('../models/FreeTimeSlot');
const User = require('../models/User');

// @desc    Generate activity suggestions for a free time slot
// @route   POST /api/suggestions
// @access  Private
const generateSuggestions = async (req, res) => {
  try {
    const { freeTimeSlotId } = req.body;
    
    if (!freeTimeSlotId) {
      return res.status(400).json({ message: 'Free time slot ID is required' });
    }
    
    const freeTimeSlot = await FreeTimeSlot.findById(freeTimeSlotId);
    
    if (!freeTimeSlot) {
      return res.status(404).json({ message: 'Free time slot not found' });
    }
    
    // Check if the free time slot belongs to the user
    if (freeTimeSlot.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Get user's activities
    const activities = await Activity.find({ user: req.user.id });
    
    // Get user preferences
    const user = await User.findById(req.user.id);
    
    // Generate suggestions using the suggestion algorithm
    const suggestions = await suggestActivities(freeTimeSlot, activities, user);
    
    // Update the free time slot with suggestions
    freeTimeSlot.suggestedActivities = suggestions.map(suggestion => ({
      activity: suggestion.activity._id,
      score: suggestion.score,
      reason: suggestion.reason
    }));
    
    freeTimeSlot.isProcessed = true;
    await freeTimeSlot.save();
    
    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get activity suggestions for a specific time duration
// @route   POST /api/suggestions/duration
// @access  Private
const getSuggestionsByDuration = async (req, res) => {
  try {
    const { duration, timeOfDay } = req.body;
    
    if (!duration) {
      return res.status(400).json({ message: 'Duration is required' });
    }
    
    // Get user's activities
    const activities = await Activity.find({ user: req.user.id });
    
    // Get user preferences
    const user = await User.findById(req.user.id);
    
    // Create a mock free time slot for the suggestion algorithm
    const mockFreeTimeSlot = {
      duration,
      start: new Date(),
      end: new Date(Date.now() + duration * 60 * 1000)
    };
    
    // If timeOfDay is provided, adjust the start time to match
    if (timeOfDay) {
      const now = new Date();
      if (timeOfDay === 'Morning') {
        mockFreeTimeSlot.start.setHours(9, 0, 0, 0);
      } else if (timeOfDay === 'Afternoon') {
        mockFreeTimeSlot.start.setHours(14, 0, 0, 0);
      } else if (timeOfDay === 'Evening') {
        mockFreeTimeSlot.start.setHours(19, 0, 0, 0);
      }
      mockFreeTimeSlot.end = new Date(mockFreeTimeSlot.start.getTime() + duration * 60 * 1000);
    }
    
    // Generate suggestions using the suggestion algorithm
    const suggestions = await suggestActivities(mockFreeTimeSlot, activities, user);
    
    res.json(suggestions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Adapt an activity to fit a shorter time slot
// @route   POST /api/suggestions/adapt
// @access  Private
const adaptActivity = async (req, res) => {
  try {
    const { activityId, availableDuration } = req.body;
    
    if (!activityId || !availableDuration) {
      return res.status(400).json({ 
        message: 'Activity ID and available duration are required' 
      });
    }
    
    const activity = await Activity.findById(activityId);
    
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' });
    }
    
    // Check if the activity belongs to the user
    if (activity.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // Check if adaptation is needed
    if (activity.duration <= availableDuration) {
      return res.json({
        original: activity,
        adapted: activity,
        adaptationNeeded: false,
        message: 'Activity already fits within available time'
      });
    }
    
    // Adapt the activity
    const adaptedActivity = {
      ...activity.toObject(),
      originalDuration: activity.duration,
      duration: availableDuration,
      adaptationReason: `Adapted to fit ${availableDuration} minutes of available time`
    };
    
    res.json({
      original: activity,
      adapted: adaptedActivity,
      adaptationNeeded: true,
      message: `Activity adapted from ${activity.duration} to ${availableDuration} minutes`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Core suggestion algorithm
const suggestActivities = async (freeTimeSlot, activities, user) => {
  // Filter activities that fit within the free time slot
  const eligibleActivities = activities.filter(activity => 
    activity.duration <= freeTimeSlot.duration
  );
  
  if (eligibleActivities.length === 0) {
    return [];
  }
  
  // Determine time of day
  const timeOfDay = getTimeOfDay(new Date(freeTimeSlot.start));
  
  // Calculate scores for each activity
  const scoredActivities = eligibleActivities.map(activity => {
    let score = 100; // Base score
    let reasons = [];
    
    // Factor 1: Time of day preference
    if (activity.preferredTimeOfDay === timeOfDay || activity.preferredTimeOfDay === 'Any') {
      score += 20;
      reasons.push(`Matches preferred time of day (${timeOfDay})`);
    }
    
    // Factor 2: Priority
    if (activity.priority === 'High') {
      score += 30;
      reasons.push('High priority activity');
    } else if (activity.priority === 'Medium') {
      score += 15;
      reasons.push('Medium priority activity');
    }
    
    // Factor 3: Activity history - when was it last done
    if (activity.lastScheduled) {
      const daysSinceLastScheduled = Math.floor(
        (Date.now() - new Date(activity.lastScheduled)) / (1000 * 60 * 60 * 24)
      );
      
      // More points for activities not done recently
      const historyScore = Math.min(daysSinceLastScheduled * 2, 30);
      score += historyScore;
      
      if (historyScore > 20) {
        reasons.push('Not done in a while');
      }
    } else {
      // Bonus for never scheduled activities
      score += 30;
      reasons.push('Never done before');
    }
    
    // Factor 4: Duration fit - prefer activities that use most of the available time
    const durationFitScore = Math.round((activity.duration / freeTimeSlot.duration) * 25);
    score += durationFitScore;
    
    if (durationFitScore > 20) {
      reasons.push('Makes good use of available time');
    }
    
    // Factor 5: Balance categories if user preference is set
    if (user.preferences.balancePriorities) {
      // Get count of completed activities by type in the last 7 days
      const activityTypeCount = getActivityTypeCount(activities);
      
      // Boost score for underrepresented activity types
      if (activityTypeCount[activity.type] < 2) {
        score += 15;
        reasons.push(`Balances activity types (${activity.type} is underrepresented)`);
      }
    }
    
    return {
      activity,
      score,
      reason: reasons.join('. ')
    };
  });
  
  // Sort by score (highest first) and return top 5
  return scoredActivities
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
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

// Helper function to count activities by type in the last 7 days
const getActivityTypeCount = (activities) => {
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const typeCounts = {};
  
  activities.forEach(activity => {
    // Count only activities completed in the last 7 days
    const recentCompletions = activity.completionHistory.filter(
      history => new Date(history.date) >= oneWeekAgo && history.completed
    );
    
    if (!typeCounts[activity.type]) {
      typeCounts[activity.type] = 0;
    }
    
    typeCounts[activity.type] += recentCompletions.length;
  });
  
  return typeCounts;
};

module.exports = {
  generateSuggestions,
  getSuggestionsByDuration,
  adaptActivity
};
