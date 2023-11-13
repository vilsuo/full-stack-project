import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import { useSelector, useDispatch } from 'react-redux';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { logout } from '../reducers/auth';
import { Typography } from '@mui/material';

const LoggedInMenu = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/profile');
  }

  const handleLogout = () => {
    handleClose();
    dispatch(logout());
    navigate('/login');
  }

  return (
    <div>
      <IconButton
        size='large'
        onClick={handleMenu}
        color='inherit'
      >
        <AccountCircle />
        <Typography
          id='toolbar-username'
          sx={{ ml: .5 }}
        >
          {user.username}
        </Typography>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
        <MenuItem onClick={handleLogout}>Logout</MenuItem>
      </Menu>
    </div>
  );
};

const NotLoggedInMenu = () => {
  return (
    <Box sx={{ flexDirection: 'row' }}>
      <Button color='inherit' component={Link} to='/login'>
        Login
      </Button>
      <Button color='inherit' component={Link} to='/register'>
        Register
      </Button>
    </Box>
  );
};

const Nav = () => {
  const currentUser = useSelector(state => state.auth.user);

  return (
    <AppBar position='static'>
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button color='inherit' component={Link} to='/'>
            Home
          </Button>
        </Box>

        { currentUser && <LoggedInMenu user={currentUser} /> }
        { !currentUser && <NotLoggedInMenu /> }
      </Toolbar>
    </AppBar>
  );
}

export default Nav;