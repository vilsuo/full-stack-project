import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux';

// reducers
import authReducer from './reducers/auth';
import usersReducer from './reducers/users';

const store = configureStore({
  reducer: {
    auth: authReducer,
    users: usersReducer,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>,
);
