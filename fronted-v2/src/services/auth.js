import axios from 'axios';

const baseUrl = '/api/auth';

const register = async credentials => {
  const response = await axios.post(
    `${baseUrl}/register`,
    credentials,
  );

  return response.data;
};

const login = async credentials => {
  const response = await axios.post(
    `${baseUrl}/login`,
    credentials,
    { withCredentials: true }
  );

  return response.data;
};

const autoLogin = async () => {
  const response = await axios.get(
    `${baseUrl}/auto-login`,
  );

  return response.data;
};

const logout = async () => {
  const response = await axios.post(
    `${baseUrl}/logout`,
    {},
  );

  return response.data;
};

export default {
  register,
  login,
  autoLogin,
  logout,
};