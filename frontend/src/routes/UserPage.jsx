import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box } from '@mui/material';

import usersService from '../services/users';
import ImageList from '../components/image/ImageList';
import Info from '../components/user/Info';

/*
TODO
- add loading animations
- (show success message on image post?)
*/

const UserPage = () => {
  const pageUsername = useParams().username;  // username of the page owner
  const [pageUser, setPageUser] = useState(); // user details of the page owner

  const currentUser = useSelector(state => state.auth.user);
  const isOwnPage = currentUser && (currentUser.username === pageUsername);

  const navigate = useNavigate();

  // load users details
  useEffect(() => {
    const fetch = async () => {
      try {
        const returnedUser = await usersService.getUser(pageUsername);
        setPageUser(returnedUser);

      } catch (error) {
        const message = error.response.data.message;
        navigate('/error', { state: { message } });
      }
    };

    fetch();
  }, [pageUsername]);

  if (!pageUser) {
    return 'loading';
  }

  return (
    <Box>
      <Info userDetails={pageUser} />

      <ImageList pageUsername={pageUsername} isOwnPage={isOwnPage} />
    </Box>
  );
};

export default UserPage;
