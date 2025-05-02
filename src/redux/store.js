import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import adminReducer from './slices/adminSlice';
import employerReducer from './slices/employerSlice';
import candidateReducer from './slices/candidateSlice';
import jobReducer from './slices/jobSlice';
import applicationReducer from './slices/applicationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    employer: employerReducer,
    candidate: candidateReducer,
    job: jobReducer,
    application: applicationReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
