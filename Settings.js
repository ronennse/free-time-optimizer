import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      browser: true,
      activityReminders: 15, // minutes before
      freeTimeAlerts: true
    },
    calendar: {
      syncFrequency: 'hourly',
      includeAllCalendars: false,
      minFreeTimeBlock: 15 // minutes
    },
    display: {
      theme: 'light',
      timeFormat: '12h'
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleNotificationChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      notifications: {
        ...settings.notifications,
        [name]: type === 'checkbox' ? checked : value
      }
    });
  };

  const handleCalendarChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      calendar: {
        ...settings.calendar,
        [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) : value)
      }
    });
  };

  const handleDisplayChange = (e) => {
    const { name, value } = e.target;
    setSettings({
      ...settings,
      display: {
        ...settings.display,
        [name]: value
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // This will be replaced with actual API calls later
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    }, 1000);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Customize your app experience</p>
      </div>

      <div className="settings-container">
        {success && (
          <div className="alert alert-success">
            Settings saved successfully!
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-card">
            <h2>Notifications</h2>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="email"
                name="email"
                checked={settings.notifications.email}
                onChange={handleNotificationChange}
              />
              <label htmlFor="email">
                Email notifications
              </label>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="browser"
                name="browser"
                checked={settings.notifications.browser}
                onChange={handleNotificationChange}
              />
              <label htmlFor="browser">
                Browser notifications
              </label>
            </div>
            
            <div className="form-group">
              <label htmlFor="activityReminders">Activity reminders (minutes before)</label>
              <select
                id="activityReminders"
                name="activityReminders"
                value={settings.notifications.activityReminders}
                onChange={handleNotificationChange}
              >
                <option value="5">5 minutes</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="freeTimeAlerts"
                name="freeTimeAlerts"
                checked={settings.notifications.freeTimeAlerts}
                onChange={handleNotificationChange}
              />
              <label htmlFor="freeTimeAlerts">
                Alert me about upcoming free time slots
              </label>
            </div>
          </div>
          
          <div className="settings-card">
            <h2>Calendar Integration</h2>
            
            <div className="form-group">
              <label htmlFor="syncFrequency">Calendar sync frequency</label>
              <select
                id="syncFrequency"
                name="syncFrequency"
                value={settings.calendar.syncFrequency}
                onChange={handleCalendarChange}
              >
                <option value="realtime">Real-time</option>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="manual">Manual only</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="includeAllCalendars"
                name="includeAllCalendars"
                checked={settings.calendar.includeAllCalendars}
                onChange={handleCalendarChange}
              />
              <label htmlFor="includeAllCalendars">
                Include all Google calendars (not just primary)
              </label>
            </div>
            
            <div className="form-group">
              <label htmlFor="minFreeTimeBlock">Minimum free time block to detect (minutes)</label>
              <input
                type="number"
                id="minFreeTimeBlock"
                name="minFreeTimeBlock"
                min="5"
                max="120"
                step="5"
                value={settings.calendar.minFreeTimeBlock}
                onChange={handleCalendarChange}
              />
            </div>
          </div>
          
          <div className="settings-card">
            <h2>Display Preferences</h2>
            
            <div className="form-group">
              <label htmlFor="theme">Theme</label>
              <select
                id="theme"
                name="theme"
                value={settings.display.theme}
                onChange={handleDisplayChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System default</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="timeFormat">Time format</label>
              <select
                id="timeFormat"
                name="timeFormat"
                value={settings.display.timeFormat}
                onChange={handleDisplayChange}
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
          
          <div className="settings-actions">
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={() => window.location.reload()}
            >
              Reset to Defaults
            </button>
          </div>
        </form>
      </div>

      <div className="page-actions">
        <Link to="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Settings;
