const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  preferences: {
    defaultActivityDuration: {
      type: Number,
      default: 30
    },
    preferredTimeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening', 'Any'],
      default: 'Any'
    },
    balancePriorities: {
      type: Boolean,
      default: true
    }
  },
  settings: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      browser: {
        type: Boolean,
        default: true
      },
      activityReminders: {
        type: Number,
        default: 15
      },
      freeTimeAlerts: {
        type: Boolean,
        default: true
      }
    },
    calendar: {
      syncFrequency: {
        type: String,
        enum: ['realtime', 'hourly', 'daily', 'manual'],
        default: 'hourly'
      },
      includeAllCalendars: {
        type: Boolean,
        default: false
      },
      minFreeTimeBlock: {
        type: Number,
        default: 15
      }
    },
    display: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'light'
      },
      timeFormat: {
        type: String,
        enum: ['12h', '24h'],
        default: '12h'
      }
    }
  },
  googleAuth: {
    googleId: {
      type: String
    },
    accessToken: {
      type: String
    },
    refreshToken: {
      type: String
    },
    tokenExpiry: {
      type: Date
    }
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
