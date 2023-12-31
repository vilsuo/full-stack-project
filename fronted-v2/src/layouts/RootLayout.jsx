import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

import { autoLogin } from '../reducers/auth';

const RootLayout = () => {
  const authenticatedUser = useSelector(state => state.auth.user);

  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  useEffect(() => {
    const checkIfAlreadyLoggedIn = async () => {
      try {
        const result = await dispatch(autoLogin()).unwrap();
        console.log('success in auto-loading', result);

      } catch (error) {
        console.log('error in auto-loading', error);
      }
      setLoading(false);
    };

    checkIfAlreadyLoggedIn();
    
  }, []);

  if (loading) {
    return <h1>Loading...</h1>
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
