import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import suggestionReducer from '../features/suggestions/suggestionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    suggestions: suggestionReducer,
  },
});
