
const createMessage = (prefix, details) => {
  let message = prefix;
  if (details) {

    message += ': '
      + ((details.constructor === Array) 
        ? details.join(' ') // multiple error messages
        : details);          // single error message
  } else {
    message += '.';
  }

  return message;
};

const Alert = ({ alert, clearAlert }) => {
  const { type, prefix, details } = alert;

  if (!prefix) return null;

  return (
    <div className={`alert ${type}`}>
      <p>{createMessage(prefix, details)}</p>
      <button className='close-btn' onClick={clearAlert}></button>
    </div>
  );
};

export default Alert;