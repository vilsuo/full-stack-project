import { useDispatch } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import { logout } from '../reducers/auth';

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
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const { username } = user;

  return (
    <Dropdown
      trigger={<Potrait user={user} />}
      menu={[
        <button onClick={() => navigate(`/users/${username}/profile`)}>Profile</button>,
        <button onClick={() => navigate(`/users/${username}/settings`)}>Settings</button>,
        <button onClick={handleLogout}>Logout</button>
      ]}
    />
  );
};

const NavBar = ({ user }) => {
  return (
    <nav>
      <NavLink to='/'>Home</NavLink>
      <NavLink to='search'>Search</NavLink>
      <NavLink to='about'>About</NavLink>
      { user
        ? <LoggedInMenu user={user} />
        : <NavLink to='auth/login'>Login</NavLink>
      }
    </nav>
  );
};

export default NavBar;
