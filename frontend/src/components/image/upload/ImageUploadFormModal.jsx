import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ImageUploadForm from './ImageUploadForm';
import Alert from '../../Alert';
import { DialogTitle, Divider, IconButton, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageUploadFormModal = ({ modalOpen, onClose, onSubmit, error, clearError }) => {
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
        <ImageUploadForm
          onSubmit={onSubmit}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadFormModal;