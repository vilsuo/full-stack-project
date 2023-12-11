import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import ImageViewForm from './ImageViewForm';
import { Box, DialogTitle, IconButton, Tooltip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const ImageViewFormModal = ({ modalOpen, onClose, image, content, canModify }) => {
  return (
    <Dialog open={modalOpen} onClose={onClose} fullWidth>
      <DialogTitle sx={{
        display: 'flex',
        flexDirection: 'row-reverse',
        alignItems: 'center',
        p: 0
      }}>
        <Tooltip title='close'>
          <IconButton size='small' onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>
      <DialogContent>
        <Box>
          <ImageViewForm
            image={image}
            content={content}
            canModify={canModify}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewFormModal;