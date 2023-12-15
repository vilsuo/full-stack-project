import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate, useParams } from 'react-router-dom';

import { Container } from '@mui/material'

import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import HomePage from './routes/HomePage';
import UserPage from './routes/UserPage';
import Footer from './components/Footer';
import Nav from './components/navbar/Nav';
import SearchPage from './routes/SearchPage';
import ErrorPage from './routes/ErrorPage';
import SettingsPage from './routes/SettingsPage';
import { useSelector } from 'react-redux';
import { useEffect } from 'react';

const PrivateRoutes = () => {
  const location = useLocation();
  const pageUsername = useParams().username;

  const currentUser = useSelector(state => state.auth.user);

  const allowAccess = currentUser && (currentUser.username === pageUsername);

  return allowAccess 
    ? <Outlet />
    : <Navigate 
        to='/login'
        replace // will cause the navigation to replace the current entry in the history stack instead of adding a new one
        state={{ from: location }}  // so user can be redirected back to this route after loggin in
      />;
};

const Users = () => {
  return (
    <Routes>
      <Route path='/'                     element={<SearchPage />} />
      <Route path='/:username'            element={<UserPage />} />
      <Route path='/'                     element={<PrivateRoutes />}>
        <Route path='/:username/settings' element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  const currentUser = useSelector(state => state.auth.user);

  useEffect(() => {
    const fetch = async () => {
      if (!currentUser) {
        return null;
      }


    };

    fetch();
  }, [currentUser]);

  return (
    <Container>
      <BrowserRouter>
        <Nav />

        <Routes>
          <Route path='/'         element={<HomePage />} />
          <Route path='/login'    element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/users/*'  element={<Users />} />
          <Route path='/error'    element={<ErrorPage />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </Container>
  );
};

export default App;
