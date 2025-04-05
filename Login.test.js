import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import Login from '../pages/Login';

// Create mock store
const mockStore = configureStore([]);

describe('Login Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: {
        user: null,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });

    // Mock the dispatch function
    store.dispatch = jest.fn();
  });

  test('renders login form correctly', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Check if important elements are rendered
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  test('handles input changes', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Get form inputs
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    // Simulate user typing
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Check if inputs have the correct values
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('submits the form with correct data', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Get form inputs and submit button
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Sign In/i });

    // Fill the form
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Submit the form
    fireEvent.click(submitButton);

    // Check if the login action was dispatched with correct data
    expect(store.dispatch).toHaveBeenCalled();
  });

  test('displays error message when authentication fails', () => {
    // Set up store with error state
    store = mockStore({
      auth: {
        user: null,
        isLoading: false,
        isError: true,
        isSuccess: false,
        message: 'Invalid credentials'
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Check if error message is displayed
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  test('shows loading state when submitting', () => {
    // Set up store with loading state
    store = mockStore({
      auth: {
        user: null,
        isLoading: true,
        isError: false,
        isSuccess: false,
        message: ''
      }
    });

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );

    // Check if button shows loading state
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Signing in/i })).toBeDisabled();
  });
});
