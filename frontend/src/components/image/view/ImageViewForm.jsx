import { 
  Avatar,
  Button, Dialog, DialogActions, DialogContent, DialogContentText,
  DialogTitle, Stack, Typography
} from '@mui/material';
import ImageInfo from './ImageInfo';
import Preview from '../Preview';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DeleteDialog = ({ open, close, handleDelete }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>
        Delete image
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are sure you want to delete this image permanently?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={close}>
          Cancel
        </Button>
        <Button onClick={handleDelete}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
};

/*
TODO
- Add profile picture to header avatar
*/
const ImageViewForm = ({ image, content, close, canModify, deleteImage }) => {
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  const { id, title, caption } = image;

  const handleDelete = async () => {
    try {
      await deleteImage(id);
      close();
    } catch (error) {
      const message = error.response.data.message;
      navigate('/error', { state: { message } });
    }
  };

  return (
    <Stack spacing={1}>
      <DeleteDialog
        open={deleteOpen}
        close={() => setDeleteOpen(false)}
        handleDelete={handleDelete}
      />

      <Avatar src={content} />
      
      <Typography variant='body1'>{title}</Typography>

      <Preview preview={content} />

      <ImageInfo
        image={image}
        canModify={canModify}
        handleDelete={() => setDeleteOpen(true)}
      />

      <Typography variant='body1' color='text.secondary'>{caption}</Typography>
    </Stack>
  );
};

export default ImageViewForm;
