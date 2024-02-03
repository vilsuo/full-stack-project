import axios from 'axios';

const BASE_URL = '/api/admin';  

const getUser = async (username) => {
  const { data } = await axios.get(`${BASE_URL}/users/${username}`);
  return data;
};

const putUser = async (username, body) => {
  const { data } = await axios.put(`${BASE_URL}/users/${username}`, body);
  return data;
};

export default {
  getUser,
  putUser,
};