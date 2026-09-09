import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// LƯU Ý: tokens.css phải nạp SAU bootstrap để ghi đè được biến --bs-*
import './styles/tokens.css';
import './styles/layout.css';
import './App.css';

import store from './redux/store';
import AppRoutes from './routes/AppRoutes';
import { SavedJobsProvider } from './context/SavedJobsContext';
import antdTheme from './theme/antdTheme';
import authService from './services/authService';

function App() {
  useEffect(() => {
    authService.setupAxiosInterceptor();
  }, []);

  return (
    <Provider store={store}>
      <ConfigProvider theme={antdTheme} locale={viVN}>
        <SavedJobsProvider>
          <BrowserRouter>
            <div className="App">
              <AppRoutes />
              <ToastContainer
                position="top-right"
                autoClose={4000}
                newestOnTop
                closeOnClick
                pauseOnHover
                draggable
                theme="light"
              />
            </div>
          </BrowserRouter>
        </SavedJobsProvider>
      </ConfigProvider>
    </Provider>
  );
}

export default App;
