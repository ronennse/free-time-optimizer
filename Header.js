import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const onLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <Link to="/">
              <h1>Free Time Optimizer</h1>
            </Link>
          </div>
          
          <nav className="main-nav">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link">Dashboard</Link>
                <Link to="/activities" className="nav-link">Activities</Link>
                <Link to="/schedule" className="nav-link">Schedule</Link>
                <Link to="/calendar" className="nav-link">Calendar</Link>
                
                <div className="user-menu">
                  <button className="user-menu-button">
                    <span className="user-avatar">{user.name.charAt(0)}</span>
                    <span className="user-name">{user.name}</span>
                  </button>
                  <div className="user-dropdown">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <Link to="/settings" className="dropdown-item">Settings</Link>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout-button"
                      onClick={onLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Sign In</Link>
                <Link to="/register" className="btn btn-primary">Sign Up</Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
