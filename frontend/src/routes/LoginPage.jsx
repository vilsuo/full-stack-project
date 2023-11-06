import { useState } from 'react'

import { useDispatch } from 'react-redux';
import { login } from '../reducers/auth';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    
    dispatch(login({ username, password }))
      .unwrap()
      .then((user) => {
        setMessage(null);
        navigate('/user');
      })
      .catch((error) => {
        setMessage(error);
        setPassword('');
      });
  };

  return (
    <>
      <ErrorAlert
        title={'Login failed'}
        message={message}
        clearMessage={() => setMessage(null)}
      />
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            username
            <input
              type='text'
              value={username}
              onChange={ ({ target }) => setUsername(target.value) }
              autoComplete='username'
              required
            />
          </label>
        </div>
        <div>
          <label>
            password
            <input
              type='password'
              value={password}
              onChange={ ({ target }) => setPassword(target.value) }
              autoComplete='current-password'
              required
            />
          </label>
        </div>
        <div>
          <button type='submit'>login</button>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
