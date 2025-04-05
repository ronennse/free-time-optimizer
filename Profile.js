import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    preferences: {
      defaultActivityDuration: 30,
      preferredTimeOfDay: 'Evening',
      balancePriorities: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handlePreferenceChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({
      ...profile,
      preferences: {
        ...profile.preferences,
        [name]: type === 'checkbox' ? checked : value
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
    <div className="profile-page">
      <div className="page-header">
        <h1>Your Profile</h1>
        <p>Manage your personal information and preferences</p>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <h2>Personal Information</h2>
          
          {success && (
            <div className="alert alert-success">
              Profile updated successfully!
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profile.email}
                onChange={handleInputChange}
                required
                disabled
              />
              <small className="form-text">Email cannot be changed</small>
            </div>
            
            <h3>Activity Preferences</h3>
            
            <div className="form-group">
              <label htmlFor="defaultActivityDuration">Default Activity Duration (minutes)</label>
              <input
                type="number"
                id="defaultActivityDuration"
                name="defaultActivityDuration"
                min="5"
                max="240"
                step="5"
                value={profile.preferences.defaultActivityDuration}
                onChange={handlePreferenceChange}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="preferredTimeOfDay">Preferred Time of Day</label>
              <select
                id="preferredTimeOfDay"
                name="preferredTimeOfDay"
                value={profile.preferences.preferredTimeOfDay}
                onChange={handlePreferenceChange}
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Any">Any Time</option>
              </select>
            </div>
            
            <div className="form-group checkbox-group">
              <input
                type="checkbox"
                id="balancePriorities"
                name="balancePriorities"
                checked={profile.preferences.balancePriorities}
                onChange={handlePreferenceChange}
              />
              <label htmlFor="balancePriorities">
                Balance priorities across different activity types
              </label>
              <small className="form-text">
                When enabled, the app will suggest a mix of different activity types to ensure a balanced lifestyle
              </small>
            </div>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
        
        <div className="account-card">
          <h2>Account Management</h2>
          
          <div className="account-section">
            <h3>Password</h3>
            <p>Secure your account with a strong password</p>
            <button className="btn btn-secondary">
              Change Password
            </button>
          </div>
          
          <div className="account-section">
            <h3>Connected Accounts</h3>
            <div className="connected-account">
              <div className="account-info">
                <span className="account-icon">G</span>
                <span className="account-name">Google</span>
              </div>
              <div className="account-status">
                <span className="status-indicator connected"></span>
                Connected
              </div>
            </div>
          </div>
          
          <div className="account-section danger-zone">
            <h3>Danger Zone</h3>
            <button className="btn btn-danger">
              Delete Account
            </button>
            <small className="form-text">
              This action cannot be undone. All your data will be permanently deleted.
            </small>
          </div>
        </div>
      </div>

      <div className="page-actions">
        <Link to="/dashboard" className="btn btn-secondary">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Profile;
