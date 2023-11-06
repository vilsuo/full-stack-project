import { useState } from 'react'

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import authService from '../services/auth';
import { useNavigate } from 'react-router-dom';
import ErrorAlert from '../components/ErrorAlert';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password1, setPassword1] = useState('');
  const [password2, setPassword2] = useState('');

  const [message, setMessage] = useState(null);

  const navigate = useNavigate();

  const clearMessage = () => setMessage(null);

  const handleSubmit = async event => {
    event.preventDefault();
    
    clearMessage();
    if (password1 === password2) {
      try {
        await authService.register({ name, username, password: password1 });
        navigate('/login');
  
      } catch (error) {
        const errorMessages = error.response.data.message;
        setMessage(errorMessages);
      }
    } else {
      setTimeout(() => {
        setMessage('passwords do not match');
      }, 100);
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 3 }}>
      <ErrorAlert
        title={'Registration failed'}
        message={message}
        clearMessage={clearMessage}
      />
      <Box component='form' onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              id='name'
              type='text'
              label='Name'
              value={name}
              onChange={ ({ target }) => setName(target.value) }
              fullWidth
              //required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              id='username'
              type='text'
              label='Username'
              value={username}
              onChange={ ({ target }) => setUsername(target.value) }
              autoComplete='username'
              fullWidth
              //required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id='password1'
              type='password'
              label='Password'
              value={password1}
              onChange={ ({ target }) => setPassword1(target.value) }
              autoComplete='new-password'
              fullWidth
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              id='password2'
              type='password'
              label='Confirm password'
              value={password2}
              onChange={ ({ target }) => setPassword2(target.value) }
              autoComplete='new-password'
              fullWidth
              required
            />
          </Grid>
        </Grid>
        <Button
          id='register'
          type='submit'
          fullWidth
          variant='contained'
          sx={{ mt: 2 }}
        >
          register
        </Button>
      </Box>
    </Stack>
  );
};

export default RegisterPage;
