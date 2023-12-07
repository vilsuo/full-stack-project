import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import ImageForm from './ImageForm';

const FormModal = ({ username, modalOpen, onClose, /*onSubmit, error*/ }) => {
  return (
    <Dialog open={modalOpen} onClose={onClose}>
      <DialogContent>
        {/*error && <Alert severity="error">{error}</Alert>*/}
        <ImageForm
          username={username}
          //onSubmit={onSubmit}
          //onCancel={onClose}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormModal;