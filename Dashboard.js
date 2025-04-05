import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from '../features/auth/authSlice';
import SuggestionComponent from '../components/suggestions/SuggestionComponent';

const Dashboard = () => {
  const [freeTimeSlots, setFreeTimeSlots] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Fetch user profile data if needed
    if (user && !user.preferences) {
      dispatch(getUserProfile());
    }
    
    // Simulate fetching free time slots and upcoming activities
    // In a real app, this would be API calls to the backend
    setTimeout(() => {
      setFreeTimeSlots([
        {
          _id: '1',
          start: new Date(Date.now() + 3600000), // 1 hour from now
          end: new Date(Date.now() + 7200000),   // 2 hours from now
          duration: 60
        },
        {
          _id: '2',
          start: new Date(Date.now() + 86400000), // Tomorrow
          end: new Date(Date.now() + 90000000),
          duration: 60
        }
      ]);
      
      setUpcomingActivities([
        {
          _id: '1',
          title: 'Morning Yoga',
          type: 'Exercise',
          duration: 30,
          start: new Date(Date.now() + 86400000), // Tomorrow
          status: 'scheduled'
        },
        {
          _id: '2',
          title: 'Learn React',
          type: 'Learning',
          duration: 45,
          start: new Date(Date.now() + 172800000), // Day after tomorrow
          status: 'scheduled'
        }
      ]);
      
      setLoading(false);
    }, 1000);
  }, [dispatch, user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {user ? user.name : 'User'}!</h1>
        <p>Here's your personalized dashboard to help you make the most of your free time.</p>
      </div>
      
      {loading ? (
        <div className="loading">Loading your dashboard...</div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <h3>Free Time Available</h3>
              <div className="stat-value">
                {freeTimeSlots.reduce((total, slot) => total + slot.duration, 0)} min
              </div>
              <p>Across {freeTimeSlots.length} time slots</p>
            </div>
            
            <div className="stat-card">
              <h3>Upcoming Activities</h3>
              <div className="stat-value">{upcomingActivities.length}</div>
              <p>Scheduled in the next 7 days</p>
            </div>
            
            <div className="stat-card">
              <h3>Activity Completion</h3>
              <div className="stat-value">85%</div>
              <p>Of scheduled activities completed</p>
            </div>
          </div>
          
          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h2>Next Available Free Time</h2>
              {freeTimeSlots.length > 0 ? (
                <SuggestionComponent freeTimeSlot={freeTimeSlots[0]} />
              ) : (
                <p>No free time slots available. Connect your calendar to detect free time.</p>
              )}
            </section>
            
            <section className="dashboard-section">
              <h2>Upcoming Activities</h2>
              {upcomingActivities.length > 0 ? (
                <div className="activity-grid">
                  {upcomingActivities.map((activity) => (
                    <div key={activity._id} className="activity-card">
                      <div className="activity-header">
                        <h3>{activity.title}</h3>
                        <span className="activity-type">{activity.type}</span>
                      </div>
                      <div className="activity-details">
                        <p><strong>Duration:</strong> {activity.duration} minutes</p>
                        <p><strong>Scheduled:</strong> {activity.start.toLocaleString()}</p>
                        <p><strong>Status:</strong> {activity.status}</p>
                      </div>
                      <div className="activity-actions">
                        <button className="btn btn-outline">View Details</button>
                        <button className="btn btn-primary">Reschedule</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No upcoming activities. Start scheduling your free time!</p>
              )}
            </section>
          </div>
          
          <div className="dashboard-cta">
            <h2>Ready to optimize your free time?</h2>
            <div className="cta-buttons">
              <button className="btn btn-primary">Add New Activity</button>
              <button className="btn btn-secondary">Connect Calendar</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
