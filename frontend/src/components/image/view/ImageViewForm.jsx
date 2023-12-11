import util from '../../../util';

import { 
  Box,
  Card, CardMedia, IconButton, Stack, Tooltip, Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';

import { useState } from 'react';

const Preview = ({ preview }) => {
  return (
    <Card sx={{ p: 2 }}>
      { preview && <CardMedia component='img' image={preview} />}
    </Card>
  );
};

const ImageEditOptions = () => {
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

      <Tooltip title='remove'>
        <IconButton size='small'>
          <DeleteIcon fontSize='inherit' />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const ImageOptions = ({ canModify }) => {
  const [like, setLike] = useState(false);
  
  return (
    <Box sx={{
      display: 'flex', flexWrap: 'nowrap', 
      justifyContent: 'flex-end', alignItems: 'center', 
    }}>
      { canModify && <ImageEditOptions /> }

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
    </Box>
  );
};

const ImageInfo = ({ image, canModify }) => {
  const { createdAt } = image;

  return (
    <Box sx={{
      display: 'flex', flexWrap: 'nowrap', 
      justifyContent: 'space-between', alignItems: 'center', 
      width: 1
    }}>
      <Typography variant='body2' color='text.secondary'>
        {util.formatDate(createdAt)}
      </Typography>

      <ImageOptions canModify={canModify} />
    </Box>
  );
};

/*
TODO
- Add profile picture to header avatar
- implement editing
*/
const ImageViewForm = ({ image, content, canModify }) => {
  const { title, caption, privacy, createdAt, updatedAt } = image;

  return (
    <Stack spacing={1}>
      <Typography variant='body1'>
        {title}
      </Typography>

      <Preview preview={content} />

      <ImageInfo image={image} canModify={canModify} />

      <Typography variant='body1' color='text.secondary'>
        {caption}
      </Typography>
    </Stack>
  );
};

export default ImageViewForm;
