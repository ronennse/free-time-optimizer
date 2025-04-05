import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import AdaptiveSchedulingComponent from '../components/suggestions/AdaptiveSchedulingComponent';

const ActivityInput = () => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'Exercise',
    duration: 30,
    preferredTimeOfDay: 'Any',
    priority: 'Medium',
  });
  
  const [activities, setActivities] = useState([
    {
      _id: '1',
      title: 'Morning Yoga',
      type: 'Exercise',
      duration: 30,
      preferredTimeOfDay: 'Morning',
      priority: 'High',
      lastScheduled: new Date(Date.now() - 86400000 * 3) // 3 days ago
    },
    {
      _id: '2',
      title: 'Learn React',
      type: 'Learning',
      duration: 45,
      preferredTimeOfDay: 'Evening',
      priority: 'Medium',
      lastScheduled: new Date(Date.now() - 86400000 * 7) // 7 days ago
    },
    {
      _id: '3',
      title: 'Read a Book',
      type: 'Relaxation',
      duration: 60,
      preferredTimeOfDay: 'Any',
      priority: 'Low',
      lastScheduled: null // Never scheduled
    }
  ]);
  
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [availableDuration, setAvailableDuration] = useState(20);
  
  const { user } = useSelector((state) => state.auth);

  const activityTypes = [
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
  ];
  
  const timeOfDayOptions = ['Morning', 'Afternoon', 'Evening', 'Any'];
  const priorityOptions = ['Low', 'Medium', 'High'];

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    
    // In a real app, this would be an API call to create the activity
    const newActivity = {
      _id: Date.now().toString(),
      ...formData,
      lastScheduled: null
    };
    
    setActivities([...activities, newActivity]);
    
    // Reset form
    setFormData({
      title: '',
      type: 'Exercise',
      duration: 30,
      preferredTimeOfDay: 'Any',
      priority: 'Medium',
    });
  };
  
  const handleSelectActivity = (activity) => {
    setSelectedActivity(activity);
  };

  return (
    <div className="activity-input-container">
      <div className="page-header">
        <h1>Manage Your Activities</h1>
        <p>Add and manage activities you enjoy doing in your free time.</p>
      </div>
      
      <div className="activity-input-content">
        <div className="activity-form-container">
          <h2>Add New Activity</h2>
          <form className="activity-form" onSubmit={onSubmit}>
            <div className="form-group">
              <label htmlFor="title">Activity Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={onChange}
                required
                placeholder="e.g., Morning Yoga, Read a Book"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="type">Activity Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={onChange}
                required
              >
                {activityTypes.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="duration">Duration (minutes)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={onChange}
                required
                min="5"
                max="240"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="preferredTimeOfDay">Preferred Time of Day</label>
              <select
                id="preferredTimeOfDay"
                name="preferredTimeOfDay"
                value={formData.preferredTimeOfDay}
                onChange={onChange}
                required
              >
                {timeOfDayOptions.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={onChange}
                required
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary btn-block">
              Add Activity
            </button>
          </form>
        </div>
        
        <div className="activities-list-container">
          <h2>Your Activities</h2>
          
          {activities.length > 0 ? (
            <div className="activity-grid">
              {activities.map((activity) => (
                <div 
                  key={activity._id} 
                  className={`activity-card ${selectedActivity && selectedActivity._id === activity._id ? 'selected' : ''}`}
                  onClick={() => handleSelectActivity(activity)}
                >
                  <div className="activity-header">
                    <h3>{activity.title}</h3>
                    <span className="activity-type">{activity.type}</span>
                  </div>
                  <div className="activity-details">
                    <p><strong>Duration:</strong> {activity.duration} minutes</p>
                    <p><strong>Preferred Time:</strong> {activity.preferredTimeOfDay}</p>
                    <p>
                      <strong>Priority:</strong> 
                      <span className={`priority-${activity.priority.toLowerCase()}`}>
                        {activity.priority}
                      </span>
                    </p>
                    <p>
                      <strong>Last Done:</strong> 
                      {activity.lastScheduled 
                        ? new Date(activity.lastScheduled).toLocaleDateString() 
                        : 'Never'}
                    </p>
                  </div>
                  <div className="activity-actions">
                    <button className="btn btn-outline">Edit</button>
                    <button className="btn btn-primary">Schedule</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No activities added yet. Add your first activity to get started!</p>
          )}
        </div>
      </div>
      
      {selectedActivity && (
        <div className="adaptive-scheduling-section">
          <h2>Try Adaptive Scheduling</h2>
          <p>See how this activity can be adapted to fit different time slots.</p>
          
          <div className="adaptive-controls">
            <label htmlFor="availableDuration">Available Time (minutes):</label>
            <input
              type="range"
              id="availableDuration"
              min="5"
              max={selectedActivity.duration}
              value={availableDuration}
              onChange={(e) => setAvailableDuration(parseInt(e.target.value))}
            />
            <span>{availableDuration} minutes</span>
          </div>
          
          <AdaptiveSchedulingComponent 
            activity={selectedActivity} 
            availableDuration={availableDuration} 
          />
        </div>
      )}
    </div>
  );
};

export default ActivityInput;
