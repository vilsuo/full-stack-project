import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ImageForm from './ImageForm';
import Alert from '../../Alert';
import { DialogTitle, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageFormModal = ({ modalOpen, onClose, onSubmit, error, clearError, username }) => {
  return (
    <Dialog open={modalOpen}>
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography variant='inherit'>Upload image</Typography>
        <Tooltip title='cancel'>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Alert
          id='upload-alert'
          clearMessage={clearError}
          { ...error }
        />
        <ImageForm
          username={username}
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageFormModal;