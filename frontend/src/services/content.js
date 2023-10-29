import axios from 'axios';

const BASE_URL = '/api/test/';

const getPublicContent = async () => {
  const { data } = await axios.get(BASE_URL + 'all');
  return data;
};

const getUserBoard = async () => {
  const { data }  = await axios.get(
    BASE_URL + 'user',
    { withCredentials: true }
  );

  return data;
};

export default {
  getPublicContent,
  getUserBoard,
}
