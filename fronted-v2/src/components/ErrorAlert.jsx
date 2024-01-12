const ErrorAlert = ({ message, clearMessage }) => {
  if (!message) {
    return null;
  }

  let messages = message;
  if (message.constructor === Array) {
    messages = message.join('. ');
  }

  return (
    <div className='alert error'>
      <p>{messages}</p>
      <button className='close-btn' onClick={clearMessage}></button>
    </div>
  );
};

export default ErrorAlert;