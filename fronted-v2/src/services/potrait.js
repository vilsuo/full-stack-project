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

export default {
  getPotraitContent,
};
