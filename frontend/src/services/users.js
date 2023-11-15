import axios from 'axios';

const BASE_URL = '/api/users';

const getUsers = async query => {
  const { data } = await axios.get(`${BASE_URL}?search=${query}`);
  return data;
};

export default {
  getUsers,
}
