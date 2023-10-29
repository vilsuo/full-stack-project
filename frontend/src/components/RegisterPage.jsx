import { useState } from 'react'

import authService from '../services/auth';
import { useNavigate } from 'react-router-dom';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    
    if (password1 === password2) {
      try {
        const response = await authService.register({ name, username, password: password1 });
        console.log('register form success', response);
        navigate('/login');
  
      } catch (error) {
        const errorMessages = error.response.data.message;
        console.log('register form error', errorMessages);
      }
    } else {
      console.log('passwords do not match', password1, password2);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            name
            <input
              type='text'
              value={name}
              onChange={ ({ target }) => setName(target.value) }
              required
            />
          </label>
        </div>
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
              value={password1}
              onChange={ ({ target }) => setPassword1(target.value) }
              autoComplete='new-password'
              required
            />
          </label>
        </div>
        <div>
          <label>
            confirm password
            <input
              type='password'
              value={password2}
              onChange={ ({ target }) => setPassword2(target.value) }
              autoComplete='new-password'
              required
            />
          </label>
        </div>
        <div>
          <button type='submit'>register</button>
        </div>
      </form>
    </>
  );
};

export default RegisterPage;
