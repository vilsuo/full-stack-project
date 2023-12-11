import util from '../../../util';

import { 
  Box, Chip, IconButton, Tooltip, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';

import { useState } from 'react';

/*
TODO
- add privacy display tag
- implement liking
    - add icon as badge, see: https://mui.com/material-ui/react-badge/
    - show liked with filled icon, and not liked with unfilled icon
- implement editing
- display more precise created time: (how long was it that item was created)
*/

const ImageEditOptions = ({ handleDelete }) => {
  return (
    <Box sx={{
      display: 'flex', flexWrap: 'nowrap', 
      justifyContent: 'flex-start', alignItems: 'center', 
    }}>
      <Tooltip title='edit'>
        <IconButton size='small'>
          <EditIcon fontSize='inherit' />
        </IconButton>
      </Tooltip>

      <Tooltip title='remove' onClick={handleDelete}>
        <IconButton size='small'>
          <DeleteIcon fontSize='inherit' />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const ImageLikeOptions = () => {
  const [like, setLike] = useState(false);

  return (
    <>
      { !like && <Tooltip title='like'>
          <IconButton size='small'>
            <FavoriteBorderOutlinedIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      }
      { like && <Tooltip title='unlike'>
          <IconButton size='small'>
            <FavoriteOutlinedIcon fontSize='inherit' />
          </IconButton>
        </Tooltip>
      }
    </>
  );
};

const ImageOptions = ({ image, canModify, handleDelete }) => {
  return (
    <Box sx={{
      display: 'flex', flexWrap: 'nowrap', 
      justifyContent: 'flex-end', alignItems: 'center', 
    }}>
      { canModify && <Chip label={image.privacy} /> }

      { canModify && <ImageEditOptions handleDelete={handleDelete} /> }

      <ImageLikeOptions />
    </Box>
  );
};

const ImageInfo = ({ image, canModify, handleDelete }) => {
  const { createdAt, privacy } = image;

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'nowrap', width: 1,
      justifyContent: 'space-between', alignItems: 'center',
    }}>
      <Typography variant='body2' color='text.secondary'>
        {util.formatDate(createdAt)}
      </Typography>

      <ImageOptions image={image} canModify={canModify} handleDelete={handleDelete} />
    </Box>
  );
};

export default ImageInfo;
