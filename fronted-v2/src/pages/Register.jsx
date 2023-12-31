
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { useState } from 'react';
import ErrorAlert from '../components/ErrorAlert';

const Register = () => {
  const [message, setMessage] = useState(null);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const navigate = useNavigate();

  const clearMessage = () => setMessage(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessage();

    if (password !== password2) {
      setMessage('Passwords do not match.');
      setPassword('');
      setPassword2('');
      return;
    }

    try {
      await authService.register({ name, username, password });
      navigate('/auth/login');

    } catch (error) {
      const { message: returnedMessage } = error.response.data;
      setMessage(returnedMessage);
    }
  };

  return (
    <div className='register container'>
      <h3>Register</h3>

      <ErrorAlert message={message} clearMessage={clearMessage} />

      <form method='post' onSubmit={handleSubmit}>
        <label>
          <span className='required'>Name:</span>
          <input 
            type='text'
            name='name'
            value={name}
            onChange={ ({ target }) => setName(target.value) }
            required
          />
        </label>
        <label>
          <span className='required'>Username:</span>
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
          <span className='required'>Password:</span>
          <input 
            type='password'
            name='password-first'
            autoComplete='new-password'
            value={password}
            onChange={ ({ target }) => setPassword(target.value) }
            required
          />
        </label>
        <label>
          <span className='required'>Confirm password:</span>
          <input 
            type='password'
            name='password-second'
            autoComplete='new-password'
            value={password2}
            onChange={ ({ target }) => setPassword2(target.value) }
            required
          />
        </label>
        <button>Register</button>
      </form>

      <p>Already have a user? Login <Link to='/login'>here</Link>.</p>
    </div>
  );
};

export default Register;