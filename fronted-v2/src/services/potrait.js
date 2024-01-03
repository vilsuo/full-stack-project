import axios from 'axios';

const BASE_URL = '/api/users';

const getPotraitContent = async (username) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/potrait/content`,
    { 
      responseType: 'blob',
    },
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

export default {
  getPotraitContent,
  putPotrait,
};
