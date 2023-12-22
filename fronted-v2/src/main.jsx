import ReactDOM from 'react-dom/client';
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux';
import './index.css';
import App from './App';

// reducers
import authReducer from './reducers/auth';
import usersReducer from './reducers/users';

/*
TODO
- add error boudaries
  - add one global
- handle user potraits
  - load when visiting user page
  - load when loggin in? how to handle page refresh?
- make user settings page owner user only
  - navigate to login on attempt
    - how to loggin in to wrong user?

- implement following in the backend
  - add route to get followings & followers
- implement blocking in the backend
*/

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
