// store.js
import { configureStore } from '@reduxjs/toolkit';
import patientReducer from './patientSlice';
import userReducer from './userSlice';
import { setupInterceptors } from './setup';

const store = configureStore({
  reducer: {
    patients: patientReducer,
    user: userReducer,
  },
});

// Import and run the interceptor setup, passing the store
setupInterceptors(store);

export default store;
