import axios from 'axios';

const BASE_URL = '/api/user';

const addImage = async formData => {
  const { data } = await axios.post(
    `${BASE_URL}/image`,
    formData,
    { withCredentials: true }
  );
  return data;
};

export default {
  addImage,
}
