import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSuggestionsByDuration, reset } from '../features/suggestions/suggestionSlice';

const SuggestionComponent = ({ freeTimeSlot }) => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const { suggestions, isLoading, isError, message } = useSelector(
    (state) => state.suggestions
  );

  useEffect(() => {
    // Reset suggestions state when component unmounts
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleGetSuggestions = () => {
    if (freeTimeSlot) {
      dispatch(getSuggestionsByDuration({
        duration: freeTimeSlot.duration,
        timeOfDay: getTimeOfDay(new Date(freeTimeSlot.start))
      }));
    }
  };

  // Helper function to determine time of day
  const getTimeOfDay = (date) => {
    const hours = date.getHours();
    if (hours >= 5 && hours < 12) {
      return 'Morning';
    } else if (hours >= 12 && hours < 17) {
      return 'Afternoon';
    } else {
      return 'Evening';
    }
  };

  return (
    <div className="suggestion-container">
      <h2>Activity Suggestions</h2>
      
      {freeTimeSlot && (
        <div className="free-time-info">
          <p>
            <strong>Available Time:</strong> {freeTimeSlot.duration} minutes
          </p>
          <p>
            <strong>From:</strong> {new Date(freeTimeSlot.start).toLocaleTimeString()}
          </p>
          <p>
            <strong>To:</strong> {new Date(freeTimeSlot.end).toLocaleTimeString()}
          </p>
          
          <button 
            className="btn btn-primary"
            onClick={handleGetSuggestions}
            disabled={isLoading}
          >
            {isLoading ? 'Getting Suggestions...' : 'Get Suggestions'}
          </button>
        </div>
      )}
      
      {isError && <div className="alert alert-danger">{message}</div>}
      
      {suggestions.length > 0 ? (
        <div className="suggestions-list">
          <h3>Recommended Activities</h3>
          {suggestions.map((suggestion, index) => (
            <div key={index} className="suggestion-card">
              <div className="suggestion-header">
                <h4>{suggestion.activity.title}</h4>
                <span className="suggestion-score">Score: {suggestion.score}</span>
              </div>
              <div className="suggestion-details">
                <p><strong>Type:</strong> {suggestion.activity.type}</p>
                <p><strong>Duration:</strong> {suggestion.activity.duration} minutes</p>
                <p><strong>Priority:</strong> {suggestion.activity.priority}</p>
                <p className="suggestion-reason">{suggestion.reason}</p>
              </div>
              <div className="suggestion-actions">
                <button className="btn btn-success">Schedule This Activity</button>
                <button className="btn btn-outline">View Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !isLoading && <p>No suggestions available. Get suggestions to see recommended activities.</p>
      )}
    </div>
  );
};

export default SuggestionComponent;
