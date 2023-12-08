import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Container } from '@mui/material'

import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import HomePage from './routes/HomePage';
import UserPage from './routes/UserPage';
import Footer from './components/Footer';
import Nav from './components/navbar/Nav';
import SearchPage from './routes/SearchPage';
import ErrorPage from './routes/ErrorPage';

const App = () => {

  return (
    <Container>
      <BrowserRouter>
        <Nav />

        <Routes>
          <Route path='/'         element={<HomePage />} />
          <Route path='/login'    element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/users/:username' element={<UserPage />} />
          <Route path='/users'    element={<SearchPage />} />
          <Route path='/error'    element={<ErrorPage />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </Container>
  );
};

export default App;
