import { NavLink, Outlet, useOutletContext } from 'react-router-dom';

const SettingsLayout = () => {
  const { user, authenticatedUser } = useOutletContext();

  const baseUrl = `/users/${user.username}/settings`;

  return (
    <div className='settings-layout'>
      <h2>Settings</h2>

      <nav>
        <NavLink to={`${baseUrl}/potrait`}>Potrait</NavLink>
        <NavLink to={`${baseUrl}/other`}>Other</NavLink>
      </nav>

      <Outlet context={{ user, authenticatedUser }} />
    </div>
  );
};

export default SettingsLayout;