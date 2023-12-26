import axios from 'axios';

const baseUrl = '/api/statistics';

const getCounts = async () => {
  const { data } = await axios.get(`${baseUrl}/count`);

  return data;
};

export default {
  getCounts,
};