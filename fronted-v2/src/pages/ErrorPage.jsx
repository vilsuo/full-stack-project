import { useLocation } from 'react-router-dom';

const ErrorPage = () => {
  const { state: { error } } = useLocation();
  
  const { message, status } = error;

  console.log('Error', error);

  return (
    <div className=''>
      <h3>Error</h3>
      <p>{message}, {status}</p>
    </div>
  );
};

export default ErrorPage;