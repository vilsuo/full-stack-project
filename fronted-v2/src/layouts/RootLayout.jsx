import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';

const Potrait = ({ user, onClick }) => {
  const { username }  = user;

  return (
    <button className='potrait-btn' onClick={onClick}>
        <span>{user.username}</span>
        <img className='avatar' 
          src='https://www.wikipedia.org/static/apple-touch/wikipedia.png'
        />
    </button>
  );
};

const LoggedInMenu = ({ user }) => {
  const [open, setOpen] = useState(false);

  return (
    <React.Fragment>
      <Potrait 
        user={user}
        onClick={() => setOpen(true)}
      />
    </React.Fragment>
  );
};

const NotLoggedInMenu = () => {
  return (
    <React.Fragment>
      <NavLink to='auth/login'>Login</NavLink>
      <NavLink to='auth/register'>Register</NavLink>
    </React.Fragment>
  );
};

const RootLayout = () => {
  const user = useSelector(state => state.auth.user);

  return (
    <div className='root-layout'>
      <header>
        <nav>
          <div className='nav-start'>
            <h1>App</h1>
            <NavLink to='/'>Home</NavLink>
            <NavLink to='about'>About</NavLink>
          </div>
          <div className='nav-end'>
            { user
              ? <LoggedInMenu user={user} />
              : <NotLoggedInMenu />
            }
          </div>
        </nav>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
