import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Zoom from '@mui/material/Zoom';

const Content = ({ messages }) => {
  return (
    <ul>
      {messages.map((msg, idx) =>
        <li key={idx}><strong>{ msg }</strong></li>
      )}
    </ul>
  );
};

const ErrorAlert = ({ title, message, clearMessage }) => {
  if (!message) {
    return null;
  }

  const isSingleMessage = (!Array.isArray(message) || message.length === 1);
  const singleMessage = isSingleMessage ? message : null;

  return (
    <Zoom in={true}>
      <Alert severity='error' onClose={clearMessage}>
        <AlertTitle>
          { title }: <strong>{`${singleMessage}.` }</strong>
        </AlertTitle>
        { !isSingleMessage && <Content messages={message} />}
      </Alert>
    </Zoom>
  );
};

export default ErrorAlert;