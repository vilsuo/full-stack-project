import { useEffect, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { Box } from '@mui/material';

import usersService from '../services/users';
import ImageView from '../components/image/view/ImageView';
import Info from '../components/user/Info';

/*
TODO
- add loading animations
- (show success message on image post?)
*/

const UserPage = () => {
  const pageUsername = useParams().username;  // username of the page owner
  const [user, setUser] = useState(); // user details of the page owner

  const navigate = useNavigate();

  // load users details
  useEffect(() => {
    const fetch = async () => {
      try {
        const returnedUser = await usersService.getUser(pageUsername);
        setUser(returnedUser);

      } catch (error) {
        const message = error.response.data.message;
        navigate('/error', { state: { message } });
      }
    };

    fetch();
  }, [pageUsername]);

  if (!user) {
    return 'loading';
  }

  return (
    <Box>
      <Info user={user} />

      <ImageView user={user} />
    </Box>
  );
};

export default UserPage;
