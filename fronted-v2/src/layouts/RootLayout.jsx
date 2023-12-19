import { useSelector } from 'react-redux';
import { Outlet } from 'react-router-dom';
import NavBar from '../components/NavBar';

const RootLayout = () => {
  const user = useSelector(state => state.auth.user);

  return (
    <div className='root-layout'>
      <header>
        <NavBar user={user} />
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default RootLayout;
