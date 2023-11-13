import { useState } from 'react'

import { useDispatch } from 'react-redux';
import { login } from '../reducers/auth';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import LockIcon from '@mui/icons-material/Lock';
import { Avatar, Paper, Typography } from '@mui/material';

import ErrorAlert from '../components/ErrorAlert';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [message, setMessage] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const clearMessage = () => setMessage(null);

  const handleSubmit = async event => {
    event.preventDefault();
    
    clearMessage();
    dispatch(login({ username, password }))
      .unwrap()
      .then((user) => {
        navigate('/user');
      })
      .catch((error) => {
        setMessage(error);
        setPassword('');
      });
  };

  return (
    <Paper spacing={2} sx={{ p: 5 }}>
      <ErrorAlert
        id='login-error'
        title='Login failed'
        message={message}
        clearMessage={clearMessage}
      />
      <Box id='login-form' component='form' onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            id='username'
            type='text'
            label='Username'
            value={username}
            onChange={ ({ target }) => setUsername(target.value) }
            autoComplete='username'
            fullWidth
            required
          />
          <TextField
            id='password'
            type='password'
            label='Password'
            value={password}
            onChange={ ({ target }) => setPassword(target.value) }
            autoComplete='current-password'
            fullWidth
            required
          />
        </Stack>
        <Button
          id='login'
          type='submit'
          fullWidth
          variant='contained'
          sx={{ mt: 2 }}
        >
          login
        </Button>
      </Box>
    </Paper>
  );
};

export default LoginPage;
