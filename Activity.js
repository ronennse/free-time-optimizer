const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
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
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'Exercise', 
      'Learning', 
      'Entertainment', 
      'Social', 
      'Family', 
      'Relaxation', 
      'Hobby', 
      'Work', 
      'Chores', 
      'Other'
    ]
  },
  duration: {
    type: Number,
    required: true,
    min: 5,
    max: 240
  },
  preferredTimeOfDay: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Any'],
    default: 'Any'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  customPriorityRules: {
    type: Object
  },
  lastScheduled: {
    type: Date
  },
  completionHistory: [{
    date: {
      type: Date
    },
    duration: {
      type: Number
    },
    completed: {
      type: Boolean,
      default: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Activity', ActivitySchema);
