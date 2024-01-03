import axios from 'axios';

const BASE_URL = '/api/users';

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

const getImageContent = async (username, imageId) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/images/${imageId}/content`,
    { 
      withCredentials: true,
      responseType: 'blob',
    },
  );

  return data;
};

const deleteImage = async (username, imageId) => {
  const { data } = await axios.delete(
    `${BASE_URL}/${username}/images/${imageId}`,
    { withCredentials: true }
  );

  return data;
};

export default {
  addImage,
  getImages,
  getImageContent,
  deleteImage,
};
