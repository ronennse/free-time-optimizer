import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import SuggestionComponent from '../components/suggestions/SuggestionComponent';

// Create mock store
const mockStore = configureStore([]);

describe('SuggestionComponent', () => {
  let store;
  const mockFreeTimeSlot = {
    _id: '1',
    start: new Date('2025-04-05T10:00:00'),
    end: new Date('2025-04-05T11:00:00'),
    duration: 60
  };

  beforeEach(() => {
    store = mockStore({
      suggestions: {
        suggestions: [],
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });

    // Mock the dispatch function
    store.dispatch = jest.fn();
  });

  test('renders component correctly with free time slot', () => {
    render(
      <Provider store={store}>
        <SuggestionComponent freeTimeSlot={mockFreeTimeSlot} />
      </Provider>
    );

    // Check if important elements are rendered
    expect(screen.getByText('Activity Suggestions')).toBeInTheDocument();
    expect(screen.getByText(/Available Time: 60 minutes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Get Suggestions/i })).toBeInTheDocument();
  });

  test('shows no suggestions message when suggestions array is empty', () => {
    render(
      <Provider store={store}>
        <SuggestionComponent freeTimeSlot={mockFreeTimeSlot} />
      </Provider>
    );

    expect(screen.getByText(/No suggestions available/i)).toBeInTheDocument();
  });

  test('dispatches getSuggestionsByDuration when button is clicked', () => {
    render(
      <Provider store={store}>
        <SuggestionComponent freeTimeSlot={mockFreeTimeSlot} />
      </Provider>
    );

    // Click the get suggestions button
    const button = screen.getByRole('button', { name: /Get Suggestions/i });
    fireEvent.click(button);

    // Check if the action was dispatched
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('displays loading state when fetching suggestions', () => {
    // Set up store with loading state
    store = mockStore({
      suggestions: {
        suggestions: [],
        isLoading: true,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });

    render(
      <Provider store={store}>
        <SuggestionComponent freeTimeSlot={mockFreeTimeSlot} />
      </Provider>
    );

    // Check if button shows loading state
    expect(screen.getByRole('button', { name: /Getting Suggestions/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Getting Suggestions/i })).toBeDisabled();
  });

  test('displays error message when suggestion fetch fails', () => {
    // Set up store with error state
    store = mockStore({
      suggestions: {
        suggestions: [],
        isLoading: false,
        isError: true,
        isSuccess: false,
        message: 'Failed to get suggestions'
      }
    });

    render(
      <Provider store={store}>
        <SuggestionComponent freeTimeSlot={mockFreeTimeSlot} />
      </Provider>
    );

    // Check if error message is displayed
    expect(screen.getByText('Failed to get suggestions')).toBeInTheDocument();
  });

  test('renders suggestions when available', () => {
    // Set up store with suggestions
    const mockSuggestions = [
      {
        activity: {
          _id: '1',
          title: 'Morning Yoga',
          type: 'Exercise',
          duration: 30,
          priority: 'High'
        },
        score: 95,
        reason: 'Fits within available time (30 min)'
      },
      {
        activity: {
          _id: '2',
          title: 'Read a Book',
          type: 'Relaxation',
          duration: 45,
          priority: 'Medium'
        },
        score: 85,
        reason: 'Fits within available time (45 min)'
      }
    ];

    store = mockStore({
      suggestions: {
        suggestions: mockSuggestions,
        isLoading: false,
        isError: false,
        isSuccess: true,
        message: ''
      }
    });

    render(
      <Provider store={store}>
        <SuggestionComponent freeTimeSlot={mockFreeTimeSlot} />
      </Provider>
    );

    // Check if suggestions are displayed
    expect(screen.getByText('Recommended Activities')).toBeInTheDocument();
    expect(screen.getByText('Morning Yoga')).toBeInTheDocument();
    expect(screen.getByText('Read a Book')).toBeInTheDocument();
    expect(screen.getByText('Score: 95')).toBeInTheDocument();
    expect(screen.getByText('Score: 85')).toBeInTheDocument();
  });
});
