import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { adaptActivity, reset } from '../features/suggestions/suggestionSlice';

const AdaptiveSchedulingComponent = ({ activity, availableDuration }) => {
  const [adapted, setAdapted] = useState(null);
  const [adaptationNeeded, setAdaptationNeeded] = useState(false);
  const dispatch = useDispatch();
  const { isLoading, isError, message } = useSelector(
    (state) => state.suggestions
  );

  useEffect(() => {
    // Check if adaptation is needed
    if (activity && availableDuration && activity.duration > availableDuration) {
      setAdaptationNeeded(true);
    } else {
      setAdaptationNeeded(false);
    }

    // Reset state when component unmounts
    return () => {
      dispatch(reset());
    };
  }, [activity, availableDuration, dispatch]);

  const handleAdaptActivity = () => {
    if (activity && availableDuration) {
      dispatch(adaptActivity({
        activityId: activity._id,
        availableDuration
      })).then((result) => {
        if (!result.error) {
          setAdapted(result.payload.adapted);
        }
      });
    }
  };

  return (
    <div className="adaptive-scheduling-container">
      <h3>Adaptive Scheduling</h3>
      
      {activity && (
        <div className="activity-info">
          <h4>{activity.title}</h4>
          <p><strong>Original Duration:</strong> {activity.duration} minutes</p>
          <p><strong>Available Time:</strong> {availableDuration} minutes</p>
          
          {adaptationNeeded ? (
            <div className="adaptation-needed">
              <p className="alert alert-warning">
                This activity needs to be adapted to fit your available time.
              </p>
              
              <button 
                className="btn btn-primary"
                onClick={handleAdaptActivity}
                disabled={isLoading}
              >
                {isLoading ? 'Adapting...' : 'Adapt Activity'}
              </button>
            </div>
          ) : (
            <p className="alert alert-success">
              This activity fits within your available time!
            </p>
          )}
        </div>
      )}
      
      {isError && <div className="alert alert-danger">{message}</div>}
      
      {adapted && (
        <div className="adapted-activity">
          <h4>Adapted Activity</h4>
          <div className="adapted-details">
            <p><strong>Title:</strong> {adapted.title}</p>
            <p><strong>New Duration:</strong> {adapted.duration} minutes</p>
            <p><strong>Original Duration:</strong> {adapted.originalDuration} minutes</p>
            <p><strong>Adaptation Reason:</strong> {adapted.adaptationReason}</p>
          </div>
          <div className="adapted-actions">
            <button className="btn btn-success">Schedule Adapted Activity</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdaptiveSchedulingComponent;
