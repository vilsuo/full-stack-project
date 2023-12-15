import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Typography from '@mui/material/Typography';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import SearchBar from './SearchBar';
import { logout } from '../../reducers/auth';
import { styled } from '@mui/material';

// see: https://mui.com/material-ui/react-app-bar/#fixed-placement
const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

const LoggedInMenu = ({ currentUser }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const username = currentUser.username;

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    navigate(`/users/${username}`);
  };

  const handleSettingsClick = () => {
    handleClose();
    navigate(`/users/${username}/settings`);
  };

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div>
      <IconButton
        id='nav-icon-btn'
        size='large'
        onClick={handleMenu}
        color='inherit'
      >
        <AccountCircle />
        <Typography
          id='nav-username'
          sx={{ ml: .5 }}
        >
          {username}
        </Typography>
      </IconButton>
      <Menu
        id='nav-profile-menu'
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
        <MenuItem onClick={handleSettingsClick}>Settings</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

const NotLoggedInMenu = () => {
  return (
    <Box sx={{ display: 'inline-flex', flexDirection: 'row' }}>
      <Button id='nav-login' color='inherit' component={Link} to='/login'>
        Login
      </Button>
      <Button id='nav-register' color='inherit' component={Link} to='/register'>
        Register
      </Button>
    </Box>
  );
};

const Nav = () => {

  const currentUser = useSelector(state => state.auth.user);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='fixed'>
        <Toolbar sx={{ justifyContent: 'space-between' }} >
          <IconButton size='large' color='inherit' component={Link} to='/'>
            <HomeIcon />
          </IconButton>
            <SearchBar />
            { currentUser && <LoggedInMenu currentUser={currentUser} /> }
            { !currentUser && <NotLoggedInMenu /> }
        </Toolbar>
      </AppBar>
      <Offset />
    </Box>
  );
};

export default Nav;