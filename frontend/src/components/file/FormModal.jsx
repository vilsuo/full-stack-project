import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Divider } from '@mui/material';
import ImageForm from './ImageForm';

const FormModal = ({ username, modalOpen, onClose, /*onSubmit, error*/ }) => {
  return (
    <Dialog open={modalOpen} onClose={onClose}>
      <DialogTitle>Add new image</DialogTitle>
      <Divider />
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