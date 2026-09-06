import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import store from './redux/store';
import AppRoutes from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';
import './App.css';
import authService from './services/authService';

function App() {
  useEffect(() => {
    // Setup axios interceptor for authentication
    authService.setupAxiosInterceptor();
    
    // Check for existing authentication
    const user = authService.getCurrentUser();
    if (user) {
      console.log('App: User found in localStorage:', user.role, user.email);
    } else {
      console.log('App: No authenticated user found');
    }
  }, []);

  return (
    <Provider store={store}>
      <SavedJobsProvider>
        <BrowserRouter>
          <div className="App">
            <AppRoutes />
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </div>
        </BrowserRouter>
      </SavedJobsProvider>
    </Provider>
  );
}

export default App;
