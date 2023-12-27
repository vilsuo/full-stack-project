import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

const RootLayout = () => {
  const authenticatedUser = useSelector(state => state.auth.user);

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
