import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { Container } from '@mui/material'

import LoginPage from './routes/LoginPage';
import RegisterPage from './routes/RegisterPage';
import HomePage from './routes/HomePage';
import ProfilePage from './routes/ProfilePage';
import BoardUserPage from './routes/BoardUserPage';
import Footer from './components/Footer';
import Nav from './components/Nav';

const App = () => {

  return (
    <Container>
      <BrowserRouter>
        <Nav />

        <Routes>
          <Route path='/'         element={<HomePage />} />
          <Route path='/home'     element={<HomePage />} />
          <Route path='/login'    element={<LoginPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/profile'  element={<ProfilePage />} />
          <Route path='/user'     element={<BoardUserPage />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </Container>
  );
};

export default App;
