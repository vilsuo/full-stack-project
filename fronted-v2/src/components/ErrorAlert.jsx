const ErrorAlert = ({ message, clearMessage }) => {
  if (!message) {
    return null;
  }

  return (
    <div className='alert error'>
      <p>{message}</p>
      <button className='close-btn' onClick={clearMessage}></button>
    </div>
  );
};

export default ErrorAlert;