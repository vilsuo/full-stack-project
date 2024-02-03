import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import { logout } from '../reducers/auth';

const UserOptions = ({ user, onClick }) => {
  const { username }  = user;

  return (
    <button className='user-options' onClick={onClick}>
      <span>{username}</span>
    </button>
  );
};

const LoggedInMenu = ({ user }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/login');
  };

  const { username } = user;

  return (
    <Dropdown
      trigger={<UserOptions user={user} />}
      menu={[
        <button onClick={() => navigate(`/users/${username}`)}>Profile</button>,
        <button onClick={() => navigate(`/users/${username}/settings`)}>Settings</button>,
        <button onClick={handleLogout}>Logout</button>
      ]}
    />
  );
};

const NavBar = ({ user }) => {
  return (
    <div className='container'>
      <nav>
        <NavLink to='/'>Home</NavLink>
        <NavLink to='search'>Search</NavLink>
        <NavLink to='about'>About</NavLink>
        
        { (user && user.admin) && (
          <NavLink to='admin'>Admin</NavLink>
        )}

        <div>
          { user
            ? <LoggedInMenu user={user} />
            : <NavLink to='login'>Login</NavLink>
          }
        </div>
      </nav>
    </div>
  );
};

export default NavBar;
