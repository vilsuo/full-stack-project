import axios from 'axios';

const BASE_URL = '/api/users';

const getPotrait = async (username) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/potrait`,
  );
  return data;
};

const putPotrait = async (username, formData) => {
  const { data } = await axios.put(
    `${BASE_URL}/${username}/potrait`,
    formData,
    { withCredentials: true }
  );
  return data;
};

const removePotrait = async (username) => {
  const { data } = await axios.delete(
    `${BASE_URL}/${username}/potrait`,
    { withCredentials: true }
  );
  return data;
};

// CONTENT
const getPotraitContent = async (username) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/potrait/content`,
    { 
      responseType: 'blob',
    },
  );
  return data;
};

export default {
  getPotrait,
  putPotrait,
  removePotrait,

  // content
  getPotraitContent,
};
