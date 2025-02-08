// userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Initial state for the user slice
const initialState = {
  user: null,   // Will hold an object with { id, username, full_name, role }
  loading: false,
  error: null,
};

// Async thunk to fetch the user data from the API.
// The "condition" option ensures that if user data already exists in the store,
// the thunk will not run.
export const fetchUser = createAsyncThunk(
  'user/fetchUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/users/me');
      // Assumes that response.data is an object with id, username, full_name, and role.
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Fetch failed');
    }
  },
  {
    condition: (_, { getState }) => {
      const { user } = getState();
      // If user data already exists, abort the fetch.
      if (user.user) {
        return false;
      }
    },
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Optional reducers if you want to set or clear the user manually
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
