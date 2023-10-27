import { useState } from 'react'

import { useDispatch } from 'react-redux';
import { login } from '../reducers/user';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();

  const handleSubmit = async event => {
    event.preventDefault();
    
    dispatch(login({ username, password }))
      .unwrap()
      .then((user) => {
        console.log('login form success', user);
      })
      .catch((error) => {
        console.log('login form error', error);
      });
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <label>
          username
          <input
            type='text'
            value={username}
            onChange={ ({ target }) => setUsername(target.value) }
          />
        </label>
        <label>
          password
          <input
            type='password'
            value={password}
            onChange={ ({ target }) => setPassword(target.value) }
          />
        </label>
        <div>
          <button type='submit'>login</button>
        </div>
      </form>
    </>
  );
};

export default LoginPage;
