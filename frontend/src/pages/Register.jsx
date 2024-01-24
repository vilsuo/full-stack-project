import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth';
import { useState } from 'react';
import Alert from '../components/Alert';
import { createErrorMessage } from '../util/error';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({});

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const navigate = useNavigate();

  const clearAlert = () => setAlert({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) return null;
    setLoading(true);

    clearAlert();

    if (password !== password2) {
      setAlert({
        type: 'error',
        prefix: 'Registering failed',
        details: 'Passwords do not match'
      });
      setPassword('');
      setPassword2('');
      
      setLoading(false);
      return;
    }

    try {
      await authService.register({ name, username, password });
      navigate('/login');

    } catch (error) {
      setAlert({ 
        type: 'error',
        prefix: 'Registering failed',
        details: createErrorMessage(error),
      });
    }

    setLoading(false);
  };

  return (
    <div className='register container'>
      <h3>Register</h3>

      <Alert alert={alert} clearAlert={clearAlert} />

      <form method='post' onSubmit={handleSubmit}>
        <label>
          <span>Name: *</span>
          <input 
            type='text'
            name='name'
            value={name}
            onChange={ ({ target }) => setName(target.value) }
            required
          />
        </label>
        <label>
          <span className='required'>Username: *</span>
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
          <span className='required'>Password: *</span>
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
          <span className='required'>Confirm password: *</span>
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