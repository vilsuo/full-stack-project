import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';

import NavBar from '../components/NavBar';
import Spinner from '../components/Spinner';

import { autoLogin } from '../reducers/auth';

const RootLayout = () => {
  const authenticatedUser = useSelector(state => state.auth.user);

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const checkIfAlreadyLoggedIn = async () => {
      try {
        await dispatch(autoLogin()).unwrap();
      } catch (error) {
        console.log('error in auto-loading', error);
      }

      setLoading(false);
    };
    
    checkIfAlreadyLoggedIn();
    
  }, []);

  if (loading) {
    return (
      <div className='root-layout'>
        <div className='spinner-container'>
          <Spinner size={64} />
        </div>
      </div>
    );
  }

  return (
    <div className='root-layout'>
      <header>
        <NavBar user={authenticatedUser} />
      </header>

      <main>
        <Outlet context={{ authenticatedUser }} />
      </main>
    </div>
  );
};

export default RootLayout;
