const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ScheduleSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tenantId: {
    type: String,
    required: true,
    index: true
  },
  activity: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
    required: true
  },
  freeTimeSlot: {
    type: Schema.Types.ObjectId,
    ref: 'FreeTimeSlot'
  },
  start: {
    type: Date,
    required: true
  },
  end: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'missed', 'cancelled', 'adapted'],
    default: 'scheduled'
  },
  originalDuration: {
    type: Number // in minutes, for tracking adapted schedules
  },
  adaptationReason: {
    type: String
  },
  calendarEventId: {
    type: String // Google Calendar event ID if synced
  },
  notifications: {
    sent: {
      type: Boolean,
      default: false
    },
    sentAt: {
      type: Date
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Schedule', ScheduleSchema);
