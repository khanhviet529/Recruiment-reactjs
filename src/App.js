import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './redux/store';
import AppRoutes from './routes/AppRoutes';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div className="App">
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
        </div>
      </Router>
    </Provider>
  );
}

export default App;
