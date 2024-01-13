import axios from 'axios';

const BASE_URL = '/api/users';

const getUsers = async (queryParams) => {
  const { data } = await axios.get(
    `${BASE_URL}`,
    { params: queryParams }
  );
  return data;
};

const getUser = async (username) => {
  const { data } = await axios.get(`${BASE_URL}/${username}`);
  return data;
};

const deleteUser = async (username) => {
  const { data } = await axios.delete(`${BASE_URL}/${username}`);
  return data;
};

export default {
  getUsers,
  getUser,
  deleteUser,
};
