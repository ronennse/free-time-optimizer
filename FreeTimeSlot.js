const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FreeTimeSlotSchema = new Schema({
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
  source: {
    type: String,
    enum: ['google_calendar', 'manual'],
    default: 'google_calendar'
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  suggestedActivities: [{
    activity: {
      type: Schema.Types.ObjectId,
      ref: 'Activity'
    },
    score: {
      type: Number
    },
    reason: {
      type: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('FreeTimeSlot', FreeTimeSlotSchema);
