import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import AdaptiveSchedulingComponent from '../components/suggestions/AdaptiveSchedulingComponent';

// Create mock store
const mockStore = configureStore([]);

describe('AdaptiveSchedulingComponent', () => {
  let store;
  const mockActivity = {
    _id: '1',
    title: 'Morning Yoga',
    type: 'Exercise',
    duration: 45,
    priority: 'High'
  };

  beforeEach(() => {
    store = mockStore({
      suggestions: {
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });

    // Mock the dispatch function
    store.dispatch = jest.fn().mockReturnValue(Promise.resolve({ payload: { adapted: {
      title: 'Quick Morning Yoga',
      duration: 20,
      originalDuration: 45,
      adaptationReason: 'Shortened to fit available time'
    }}}));
  });

  test('renders component correctly with activity and available duration', () => {
    render(
      <Provider store={store}>
        <AdaptiveSchedulingComponent 
          activity={mockActivity} 
          availableDuration={20} 
        />
      </Provider>
    );

    // Check if important elements are rendered
    expect(screen.getByText('Adaptive Scheduling')).toBeInTheDocument();
    expect(screen.getByText(mockActivity.title)).toBeInTheDocument();
    expect(screen.getByText(/Original Duration: 45 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/Available Time: 20 minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/This activity needs to be adapted to fit your available time/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adapt Activity/i })).toBeInTheDocument();
  });

  test('shows "fits within time" message when activity duration is less than available time', () => {
    render(
      <Provider store={store}>
        <AdaptiveSchedulingComponent 
          activity={mockActivity} 
          availableDuration={60} 
        />
      </Provider>
    );

    expect(screen.getByText(/This activity fits within your available time/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Adapt Activity/i })).not.toBeInTheDocument();
  });

  test('dispatches adaptActivity when button is clicked', async () => {
    render(
      <Provider store={store}>
        <AdaptiveSchedulingComponent 
          activity={mockActivity} 
          availableDuration={20} 
        />
      </Provider>
    );

    // Click the adapt activity button
    const button = screen.getByRole('button', { name: /Adapt Activity/i });
    fireEvent.click(button);

    // Check if the action was dispatched
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('displays loading state when adapting activity', () => {
    // Set up store with loading state
    store = mockStore({
      suggestions: {
        isLoading: true,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });

    render(
      <Provider store={store}>
        <AdaptiveSchedulingComponent 
          activity={mockActivity} 
          availableDuration={20} 
        />
      </Provider>
    );

    // Check if button shows loading state
    expect(screen.getByRole('button', { name: /Adapting/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Adapting/i })).toBeDisabled();
  });

  test('displays error message when adaptation fails', () => {
    // Set up store with error state
    store = mockStore({
      suggestions: {
        isLoading: false,
        isError: true,
        isSuccess: false,
        message: 'Failed to adapt activity'
      }
    });

    render(
      <Provider store={store}>
        <AdaptiveSchedulingComponent 
          activity={mockActivity} 
          availableDuration={20} 
        />
      </Provider>
    );

    // Check if error message is displayed
    expect(screen.getByText('Failed to adapt activity')).toBeInTheDocument();
  });
});
