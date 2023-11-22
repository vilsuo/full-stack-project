import axios from 'axios';

const BASE_URL = '/api/users';

const getUsers = async query => {
  const { data } = await axios.get(`${BASE_URL}?search=${query}`);
  return data;
};

const addImage = async (userPage, formData) => {
  const { data } = await axios.post(
    `${BASE_URL}/${userPage}/images`,
    formData,
    { withCredentials: true }
  );
  return data;
};

export default {
  getUsers,
  addImage,
};
