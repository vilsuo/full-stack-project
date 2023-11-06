import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import HomePage from './routes/HomePage';
import ProfilePage from './routes/ProfilePage';
import BoardUserPage from './routes/BoardUserPage';
import Footer from './components/Footer';

import { useDispatch, useSelector } from 'react-redux';
import { logout } from './reducers/auth';

const App = () => {
  const currentUser = useSelector(state => state.auth.user);
  const dispatch = useDispatch();

  return (
    <div>
      <BrowserRouter>
        <div style={{ padding: 5 }}>
          <Link to='/' >App</Link>
          <div>
            <li>
              <Link to={'/home'}>Home</Link>
            </li>

            {currentUser && (
              <li>
                <Link to={'/user'}>User</Link>
              </li>
            )}
          </div>

          {currentUser ? (
            <div>
              <li>
                <Link to={'/profile'}>
                  {currentUser.username}
                </Link>
              </li>
              <li>
                <Link to='/login' onClick={ () => dispatch(logout()) }>Logout</Link>
              </li>
            </div>
          ) : (
            <div >
              <li>
                <Link to={'/login'}>Login</Link>
              </li>
              <li>
                <Link to={'/register'}>Sign Up</Link>
              </li>
            </div>
          )}
        </div>

        <div>
          <Routes>
            <Route exact path='/' element={<HomePage />} />
            <Route exact path='/home' element={<HomePage />} />
            <Route exact path='/login' element={<LoginPage />} />
            <Route exact path='/register' element={<RegisterPage />} />
            <Route exact path='/profile' element={<ProfilePage />} />
            <Route path='/user' element={<BoardUserPage />} />
          </Routes>
        </div>

        <Footer />
      </BrowserRouter>
    </div>
  );
};

export default App;
