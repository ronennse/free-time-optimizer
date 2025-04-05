import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ScheduleView = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState('week');
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Simulate fetching schedules
    // In a real app, this would be an API call
    setTimeout(() => {
      const mockSchedules = [
        {
          id: '1',
          activity: {
            title: 'Morning Yoga',
            type: 'Exercise'
          },
          start: new Date(Date.now() + 3600000), // 1 hour from now
          end: new Date(Date.now() + 5400000),   // 1.5 hours from now
          duration: 30,
          status: 'scheduled'
        },
        {
          id: '2',
          activity: {
            title: 'Learn React',
            type: 'Learning'
          },
          start: new Date(Date.now() + 86400000), // Tomorrow
          end: new Date(Date.now() + 88200000),   // Tomorrow + 30 min
          duration: 30,
          status: 'scheduled'
        },
        {
          id: '3',
          activity: {
            title: 'Read a Book',
            type: 'Relaxation'
          },
          start: new Date(Date.now() - 86400000), // Yesterday
          end: new Date(Date.now() - 82800000),   // Yesterday + 1 hour
          duration: 60,
          status: 'completed'
        },
        {
          id: '4',
          activity: {
            title: 'Call Parents',
            type: 'Family'
          },
          start: new Date(Date.now() - 172800000), // 2 days ago
          end: new Date(Date.now() - 171000000),   // 2 days ago + 30 min
          duration: 30,
          status: 'missed'
        }
      ];
      
      setSchedules(mockSchedules);
      setLoading(false);
    }, 1000);
  }, []);

  // Group schedules by day
  const groupedSchedules = schedules.reduce((groups, schedule) => {
    // Filter based on status if needed
    if (filter !== 'all' && schedule.status !== filter) {
      return groups;
    }
    
    // Filter based on date range
    const now = new Date();
    const scheduleDate = new Date(schedule.start);
    
    if (dateRange === 'today' && scheduleDate.toDateString() !== now.toDateString()) {
      return groups;
    }
    
    if (dateRange === 'week') {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const weekAhead = new Date(now);
      weekAhead.setDate(now.getDate() + 7);
      
      if (scheduleDate < weekAgo || scheduleDate > weekAhead) {
        return groups;
      }
    }
    
    if (dateRange === 'month') {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      const monthAhead = new Date(now);
      monthAhead.setMonth(now.getMonth() + 1);
      
      if (scheduleDate < monthAgo || scheduleDate > monthAhead) {
        return groups;
      }
    }
    
    const dateString = scheduleDate.toDateString();
    if (!groups[dateString]) {
      groups[dateString] = [];
    }
    
    groups[dateString].push(schedule);
    return groups;
  }, {});

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleDateRangeChange = (e) => {
    setDateRange(e.target.value);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'missed':
        return 'status-missed';
      case 'adapted':
        return 'status-adapted';
      default:
        return 'status-scheduled';
    }
  };

  return (
    <div className="schedule-view-container">
      <div className="page-header">
        <h1>Your Schedule</h1>
        <p>View and manage your scheduled activities.</p>
      </div>
      
      <div className="schedule-filters">
        <div className="form-group">
          <label htmlFor="filter">Status:</label>
          <select 
            id="filter" 
            value={filter} 
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="missed">Missed</option>
            <option value="adapted">Adapted</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="dateRange">Date Range:</label>
          <select 
            id="dateRange" 
            value={dateRange} 
            onChange={handleDateRangeChange}
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>
      
      {loading ? (
        <div className="loading">Loading your schedule...</div>
      ) : (
        <div className="schedule-container">
          {Object.keys(groupedSchedules).length > 0 ? (
            Object.keys(groupedSchedules)
              .sort((a, b) => new Date(a) - new Date(b))
              .map((dateString) => (
                <div key={dateString} className="schedule-day">
                  <div className="day-header">
                    <h2>{dateString}</h2>
                    <span>{groupedSchedules[dateString].length} activities</span>
                  </div>
                  
                  {groupedSchedules[dateString]
                    .sort((a, b) => new Date(a.start) - new Date(b.start))
                    .map((schedule) => (
                      <div key={schedule.id} className="schedule-item">
                        <div className="schedule-time">
                          {new Date(schedule.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        
                        <div className="schedule-details">
                          <h3>{schedule.activity.title}</h3>
                          <div className="schedule-meta">
                            <span className="activity-type">{schedule.activity.type}</span>
                            <span className={`schedule-status ${getStatusClass(schedule.status)}`}>
                              {schedule.status}
                            </span>
                          </div>
                          <p>{schedule.duration} minutes</p>
                        </div>
                        
                        <div className="schedule-actions">
                          {schedule.status === 'scheduled' && (
                            <>
                              <button className="btn btn-outline btn-sm">Edit</button>
                              <button className="btn btn-primary btn-sm">Complete</button>
                            </>
                          )}
                          {schedule.status === 'completed' && (
                            <button className="btn btn-outline btn-sm">Details</button>
                          )}
                          {schedule.status === 'missed' && (
                            <button className="btn btn-primary btn-sm">Reschedule</button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ))
          ) : (
            <div className="empty-schedule">
              <p>No activities found for the selected filters.</p>
              <button className="btn btn-primary">Schedule New Activity</button>
            </div>
          )}
        </div>
      )}
      
      <div className="schedule-summary">
        <h2>Schedule Summary</h2>
        <div className="summary-stats">
          <div className="stat-card">
            <h3>Total Activities</h3>
            <div className="stat-value">{schedules.length}</div>
          </div>
          
          <div className="stat-card">
            <h3>Completed</h3>
            <div className="stat-value">
              {schedules.filter(s => s.status === 'completed').length}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Upcoming</h3>
            <div className="stat-value">
              {schedules.filter(s => s.status === 'scheduled').length}
            </div>
          </div>
          
          <div className="stat-card">
            <h3>Missed</h3>
            <div className="stat-value">
              {schedules.filter(s => s.status === 'missed').length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleView;
