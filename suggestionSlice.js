import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../utils/api';

const initialState = {
  suggestions: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: ''
};

// Generate suggestions for a free time slot
export const generateSuggestions = createAsyncThunk(
  'suggestions/generate',
  async (freeTimeSlotId, thunkAPI) => {
    try {
      const response = await API.post('/suggestions', { freeTimeSlotId });
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get suggestions by duration
export const getSuggestionsByDuration = createAsyncThunk(
  'suggestions/byDuration',
  async (data, thunkAPI) => {
    try {
      const response = await API.post('/suggestions/duration', data);
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Adapt activity to fit shorter time slot
export const adaptActivity = createAsyncThunk(
  'suggestions/adapt',
  async (data, thunkAPI) => {
    try {
      const response = await API.post('/suggestions/adapt', data);
      return response.data;
    } catch (error) {
      const message = 
        (error.response && 
          error.response.data && 
          error.response.data.message) ||
        error.message ||
        error.toString();
        
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const suggestionSlice = createSlice({
  name: 'suggestions',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    clearSuggestions: (state) => {
      state.suggestions = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateSuggestions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(generateSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.suggestions = action.payload;
      })
      .addCase(generateSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSuggestionsByDuration.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSuggestionsByDuration.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.suggestions = action.payload;
      })
      .addCase(getSuggestionsByDuration.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(adaptActivity.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(adaptActivity.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // We don't update suggestions here as this is a separate operation
      })
      .addCase(adaptActivity.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { reset, clearSuggestions } = suggestionSlice.actions;
export default suggestionSlice.reducer;
