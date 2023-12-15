import util from '../../util';

import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';
import { useEffect } from 'react';
import usersService from '../../services/users';

/*
TODO
- implement a profile picture & profile description for users
- implement blocking/following of users
*/
const NonOwnerActions = () => {
  return (
    <CardActions>
      <Button
        component='label'
        variant='contained'
        size='small'
        startIcon={<PersonAddIcon />}
      >
        Follow
      </Button>
      <Button
        component='label'
        variant='contained'
        size='small'
        startIcon={<BlockIcon />}
      >
        Block
      </Button>
    </CardActions>
  );
};

const Info = ({ user, currentUser, isOwnPage }) => {
  const { name, username, createdAt } = user;

  const showFollowAndBlock = currentUser && !isOwnPage;

  /*
  useEffect(() => {
    const fetch = async () => {
      const data = await usersService.getPotraitContent(user.username);
      
    };

    return fetch();
  }, [user]);
  */

  return (
    <Card>
      <CardMedia
        sx={{ height: 140 }}
        image="/static/images/cards/contemplative-reptile.jpg"
      />
      <CardContent>
        <Typography gutterBottom variant='h5' component='div'>
          {name}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          {username}
        </Typography>
        <Typography>
          joined {util.formatDate(createdAt)}
        </Typography>
      </CardContent>
      { showFollowAndBlock && <NonOwnerActions /> }
    </Card>
  );
};

export default Info;