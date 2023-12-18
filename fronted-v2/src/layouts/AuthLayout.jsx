import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';

const AuthLayout = () => {
  const [message, setMessage] = useState(null);

  const clearMessage = () => setMessage(null);

  return (
    <div className='auth-layout'>
      <ErrorAlert message={message} clearMessage={clearMessage} />

      <Outlet context={[message, setMessage]} />
    </div>
  );
};

export default AuthLayout;