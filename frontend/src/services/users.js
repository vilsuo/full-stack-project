import axios from 'axios';

const BASE_URL = '/api/users';

const getUsers = async query => {
  const { data } = await axios.get(`${BASE_URL}?search=${query}`);
  return data;
};

const getUser = async (username) => {
  const { data } = await axios.get(`${BASE_URL}/${username}`);
  return data;
};

const addImage = async (username, formData) => {
  const { data } = await axios.post(
    `${BASE_URL}/${username}/images`,
    formData,
    { withCredentials: true }
  );
  return data;
};

const getImages = async (username) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/images`,
    { withCredentials: true }
  );
  return data;
};

export default {
  getUsers,
  getUser,
  addImage,
  getImages,
};
