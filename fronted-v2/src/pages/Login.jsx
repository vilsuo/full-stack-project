import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { login } from '../reducers/auth';
import Alert from '../components/Alert';

const Login = () => {
  const [alert, setAlert] = useState({});

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  //const location = useLocation();
  const navigate = useNavigate();

  const clearAlert = () => setAlert({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    clearAlert();
    dispatch(login({ username, password }))
      .unwrap()
      .then(() => {
        /*
        const { from } = location.state || { from: { pathname: '/' } };
        navigate(from, { replace: true });
        */
        navigate('/');
      })
      .catch(rejectedValueError => {
        setAlert({
          type: 'error',
          prefix: 'Login failed',
          details: rejectedValueError,
        });
        setPassword('');
      });
  };

  return (
    <div className='login container'>
      <h3>Login</h3>

      <Alert alert={alert} clearAlert={clearAlert} />

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