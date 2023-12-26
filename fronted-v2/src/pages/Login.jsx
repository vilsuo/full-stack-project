import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { login } from '../reducers/auth';
import ErrorAlert from '../components/ErrorAlert';
import { addUser } from '../reducers/users';

const Login = () => {
  const [message, setMessage] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const clearMessage = () => setMessage(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    clearMessage();
    dispatch(login({ username, password }))
      .unwrap()
      .then((auth) => {
        dispatch(addUser(auth.user));
        
        const { from } = location.state || { from: { pathname: '/' } };
        navigate(from, { replace: true });
      })
      .catch((error) => {
        setMessage(error);
        setPassword('');
      });
  };

  return (
    <div className='login container'>
      <h3>Login</h3>

      <ErrorAlert message={message} clearMessage={clearMessage} />

      <form method='post' onSubmit={handleSubmit}>
        <label>
          <span>Username:</span>
          <input 
            type='text'
            name='username'
            autoComplete='username'
            value={username}
            onChange={ ({ target }) => setUsername(target.value) }
            required
          />
        </label>
        <label>
          <span>Password:</span>
          <input 
            type='password'
            name='password'
            autoComplete='current-password'
            value={password}
            onChange={ ({ target }) => setPassword(target.value) }
            required
          />
        </label>
        <button>Login</button>
      </form>

      <p>Do not have a user? Register <Link to='/register'>here</Link>.</p>
    </div>
  );
};

export default Login;