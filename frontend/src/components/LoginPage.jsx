import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContextProvider';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { login } = useContext(AuthContext);

  const navigate = useNavigate();

  const handleSubmit = async event => {
    event.preventDefault();
    
    try {
      await login({ username, password });
      console.log('login successful');
      navigate('/profile')
      
    } catch (error) {
      console.log('error', error);
    }
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
