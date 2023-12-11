import util from '../../util';

import { Button, Card, CardActions, CardContent, CardMedia, Typography } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import BlockIcon from '@mui/icons-material/Block';

/*
TODO
- implement a profile picture & profile description for users
- implement blocking/following of users
*/

const Info = ({ user }) => {
  const { name, username, createdAt } = user;

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
    </Card>
  );
};

export default Info;