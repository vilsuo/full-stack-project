import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ImageForm from './ImageForm';
import Alert from '../Alert';

const FormModal = ({ modalOpen, onClose, onSubmit, error, clearError, username }) => {
  return (
    <Dialog open={modalOpen} onClose={onClose}>
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
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormModal;