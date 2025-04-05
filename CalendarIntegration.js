import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const CalendarIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [freeTimeSlots, setFreeTimeSlots] = useState([]);
  
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    // Simulate checking if user has connected Google Calendar
    // In a real app, this would check user.googleAuth or make an API call
    setTimeout(() => {
      setIsConnected(false);
    }, 500);
  }, [user]);

  const handleConnectCalendar = () => {
    setLoading(true);
    
    // Simulate OAuth flow
    // In a real app, this would redirect to Google OAuth consent screen
    setTimeout(() => {
      setIsConnected(true);
      setCalendarData({
        email: 'user@example.com',
        connectedAt: new Date(),
        lastSync: new Date()
      });
      setLoading(false);
      
      // Simulate finding free time slots
      setFreeTimeSlots([
        {
          id: '1',
          start: new Date(Date.now() + 3600000), // 1 hour from now
          end: new Date(Date.now() + 7200000),   // 2 hours from now
          duration: 60
        },
        {
          id: '2',
          start: new Date(Date.now() + 86400000), // Tomorrow
          end: new Date(Date.now() + 90000000),
          duration: 60
        },
        {
          id: '3',
          start: new Date(Date.now() + 172800000), // Day after tomorrow
          end: new Date(Date.now() + 180000000),
          duration: 120
        }
      ]);
    }, 2000);
  };

  const handleDisconnectCalendar = () => {
    setLoading(true);
    
    // Simulate disconnecting calendar
    // In a real app, this would make an API call to revoke access
    setTimeout(() => {
      setIsConnected(false);
      setCalendarData(null);
      setFreeTimeSlots([]);
      setLoading(false);
    }, 1000);
  };

  const handleSyncCalendar = () => {
    setLoading(true);
    
    // Simulate syncing calendar
    // In a real app, this would make an API call to refresh free time slots
    setTimeout(() => {
      setCalendarData({
        ...calendarData,
        lastSync: new Date()
      });
      setLoading(false);
      
      // Update free time slots
      setFreeTimeSlots([
        ...freeTimeSlots,
        {
          id: '4',
          start: new Date(Date.now() + 259200000), // 3 days from now
          end: new Date(Date.now() + 266400000),
          duration: 120
        }
      ]);
    }, 1500);
  };

  return (
    <div className="calendar-integration-container">
      <div className="page-header">
        <h1>Calendar Integration</h1>
        <p>Connect your Google Calendar to automatically detect free time slots.</p>
      </div>
      
      <div className="calendar-container">
        <div className="calendar-status">
          <div className={`status-indicator ${isConnected ? 'status-connected' : 'status-disconnected'}`}></div>
          <h3>{isConnected ? 'Connected' : 'Not Connected'}</h3>
        </div>
        
        {loading ? (
          <div className="loading">Processing your request...</div>
        ) : (
          <>
            {isConnected ? (
              <div className="calendar-details">
                <p><strong>Connected Account:</strong> {calendarData.email}</p>
                <p><strong>Connected Since:</strong> {calendarData.connectedAt.toLocaleString()}</p>
                <p><strong>Last Synchronized:</strong> {calendarData.lastSync.toLocaleString()}</p>
                
                <div className="calendar-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleSyncCalendar}
                  >
                    Sync Calendar
                  </button>
                  <button 
                    className="btn btn-outline"
                    onClick={handleDisconnectCalendar}
                  >
                    Disconnect Calendar
                  </button>
                </div>
              </div>
            ) : (
              <div className="calendar-connect">
                <p>Connect your Google Calendar to automatically detect free time slots in your schedule.</p>
                <p>We only access your calendar events to find the gaps between them - your event details remain private.</p>
                
                <div className="calendar-actions">
                  <button 
                    className="btn btn-primary"
                    onClick={handleConnectCalendar}
                  >
                    Connect Google Calendar
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {isConnected && freeTimeSlots.length > 0 && (
        <div className="free-time-container">
          <h2>Detected Free Time Slots</h2>
          <p>We found the following free time slots in your calendar:</p>
          
          <div className="free-time-list">
            {freeTimeSlots.map((slot) => (
              <div key={slot.id} className="free-time-card">
                <div className="free-time-header">
                  <h3>{slot.duration} minutes available</h3>
                </div>
                <div className="free-time-details">
                  <p><strong>Start:</strong> {slot.start.toLocaleString()}</p>
                  <p><strong>End:</strong> {slot.end.toLocaleString()}</p>
                </div>
                <div className="free-time-actions">
                  <button className="btn btn-primary">Get Suggestions</button>
                  <button className="btn btn-outline">Schedule Manually</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="calendar-settings">
        <h2>Calendar Settings</h2>
        
        <div className="settings-form">
          <div className="form-group">
            <label htmlFor="syncFrequency">Sync Frequency</label>
            <select id="syncFrequency" defaultValue="hourly">
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="manual">Manual Only</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="minFreeTime">Minimum Free Time Duration (minutes)</label>
            <input 
              type="number" 
              id="minFreeTime" 
              defaultValue="15" 
              min="5" 
              max="120"
            />
          </div>
          
          <div className="form-group checkbox-group">
            <input type="checkbox" id="includeAllCalendars" />
            <label htmlFor="includeAllCalendars">Include all calendars (not just primary)</label>
          </div>
          
          <button className="btn btn-primary">Save Settings</button>
        </div>
      </div>
    </div>
  );
};

export default CalendarIntegration;
