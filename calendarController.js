const { google } = require('googleapis');
const User = require('../models/User');
const FreeTimeSlot = require('../models/FreeTimeSlot');

// Google OAuth2 configuration
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// @desc    Get Google OAuth URL for authentication
// @route   GET /api/calendar/auth-url
// @access  Private
const getAuthUrl = async (req, res) => {
  try {
    const scopes = [
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent' // Force to get refresh token
    });

    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Handle Google OAuth callback
// @route   GET /api/calendar/callback
// @access  Private
const handleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    
    // Set credentials
    oauth2Client.setCredentials(tokens);
    
    // Get user info from Google
    const people = google.people({ version: 'v1', auth: oauth2Client });
    const userInfo = await people.people.get({
      resourceName: 'people/me',
      personFields: 'emailAddresses,names'
    });
    
    const googleEmail = userInfo.data.emailAddresses[0].value;
    
    // Find user by ID from auth middleware
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user with Google auth info
    user.googleAuth = {
      googleId: userInfo.data.resourceName.split('/')[1],
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiry: new Date(Date.now() + tokens.expiry_date)
    };
    
    await user.save();
    
    res.json({ 
      message: 'Google Calendar connected successfully',
      googleEmail
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during OAuth callback' });
  }
};

// @desc    Disconnect Google Calendar
// @route   DELETE /api/calendar/disconnect
// @access  Private
const disconnectCalendar = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Clear Google auth info
    user.googleAuth = undefined;
    await user.save();
    
    res.json({ message: 'Google Calendar disconnected successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Fetch free time slots from Google Calendar
// @route   GET /api/calendar/free-time
// @access  Private
const getFreeTimeSlots = async (req, res) => {
  try {
    const { startDate, endDate, minDuration } = req.query;
    
    // Default to today if no start date provided
    const start = startDate ? new Date(startDate) : new Date();
    
    // Default to 7 days from start if no end date provided
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Default minimum duration to 15 minutes if not specified
    const minDurationMinutes = minDuration ? parseInt(minDuration) : 15;
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.googleAuth || !user.googleAuth.accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }
    
    // Set up OAuth client with user's tokens
    oauth2Client.setCredentials({
      access_token: user.googleAuth.accessToken,
      refresh_token: user.googleAuth.refreshToken
    });
    
    // Check if token is expired and refresh if needed
    if (new Date() > new Date(user.googleAuth.tokenExpiry)) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      user.googleAuth.accessToken = credentials.access_token;
      if (credentials.refresh_token) {
        user.googleAuth.refreshToken = credentials.refresh_token;
      }
      user.googleAuth.tokenExpiry = new Date(Date.now() + credentials.expiry_date);
      
      await user.save();
      
      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: user.googleAuth.refreshToken
      });
    }
    
    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Get busy times from primary calendar
    const busyTimes = await calendar.freebusy.query({
      requestBody: {
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        items: [{ id: 'primary' }]
      }
    });
    
    const events = busyTimes.data.calendars.primary.busy;
    
    // Find free time slots between busy periods
    const freeSlots = findFreeTimeSlots(start, end, events, minDurationMinutes);
    
    // Save free time slots to database
    const savedSlots = [];
    for (const slot of freeSlots) {
      const newSlot = await FreeTimeSlot.create({
        user: req.user.id,
        tenantId: user.tenantId,
        start: slot.start,
        end: slot.end,
        duration: slot.duration,
        source: 'google_calendar'
      });
      
      savedSlots.push(newSlot);
    }
    
    res.json(savedSlots);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching free time slots' });
  }
};

// Helper function to find free time slots between busy periods
const findFreeTimeSlots = (start, end, busyPeriods, minDurationMinutes) => {
  const freeSlots = [];
  let currentStart = new Date(start);
  
  // Sort busy periods by start time
  busyPeriods.sort((a, b) => new Date(a.start) - new Date(b.start));
  
  // Find gaps between busy periods
  for (const busy of busyPeriods) {
    const busyStart = new Date(busy.start);
    const busyEnd = new Date(busy.end);
    
    // If there's a gap between current start and busy start, it's a free slot
    if (busyStart > currentStart) {
      const duration = Math.round((busyStart - currentStart) / (1000 * 60));
      
      // Only include if duration meets minimum requirement
      if (duration >= minDurationMinutes) {
        freeSlots.push({
          start: currentStart,
          end: busyStart,
          duration
        });
      }
    }
    
    // Move current start to the end of this busy period
    if (busyEnd > currentStart) {
      currentStart = new Date(busyEnd);
    }
  }
  
  // Check if there's free time after the last busy period
  if (currentStart < end) {
    const duration = Math.round((end - currentStart) / (1000 * 60));
    
    // Only include if duration meets minimum requirement
    if (duration >= minDurationMinutes) {
      freeSlots.push({
        start: currentStart,
        end,
        duration
      });
    }
  }
  
  return freeSlots;
};

// @desc    Create calendar event for scheduled activity
// @route   POST /api/calendar/events
// @access  Private
const createCalendarEvent = async (req, res) => {
  try {
    const { scheduleId, title, start, end, description } = req.body;
    
    if (!scheduleId || !title || !start || !end) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.googleAuth || !user.googleAuth.accessToken) {
      return res.status(400).json({ message: 'Google Calendar not connected' });
    }
    
    // Set up OAuth client with user's tokens
    oauth2Client.setCredentials({
      access_token: user.googleAuth.accessToken,
      refresh_token: user.googleAuth.refreshToken
    });
    
    // Check if token is expired and refresh if needed
    if (new Date() > new Date(user.googleAuth.tokenExpiry)) {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      user.googleAuth.accessToken = credentials.access_token;
      if (credentials.refresh_token) {
        user.googleAuth.refreshToken = credentials.refresh_token;
      }
      user.googleAuth.tokenExpiry = new Date(Date.now() + credentials.expiry_date);
      
      await user.save();
      
      oauth2Client.setCredentials({
        access_token: credentials.access_token,
        refresh_token: user.googleAuth.refreshToken
      });
    }
    
    // Initialize Google Calendar API
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Create event
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: description || 'Scheduled by Free Time Optimizer',
        start: {
          dateTime: new Date(start).toISOString()
        },
        end: {
          dateTime: new Date(end).toISOString()
        }
      }
    });
    
    // Update schedule with calendar event ID
    const Schedule = require('../models/Schedule');
    const schedule = await Schedule.findById(scheduleId);
    
    if (schedule) {
      schedule.calendarEventId = event.data.id;
      await schedule.save();
    }
    
    res.json({
      message: 'Event created successfully',
      eventId: event.data.id,
      htmlLink: event.data.htmlLink
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error creating calendar event' });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  disconnectCalendar,
  getFreeTimeSlots,
  createCalendarEvent
};
