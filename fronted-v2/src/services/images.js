import axios from 'axios';

const BASE_URL = '/api/users';

const createImage = async (username, formData) => {
  const { data } = await axios.post(
    `${BASE_URL}/${username}/images`,
    formData,
  );
  return data;
};

const getImages = async (username) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/images`,
  );
  return data;
};

const getImage = async (username, imageId) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/images/${imageId}`,
  );
  return data;
};


const getImageContent = async (username, imageId) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/images/${imageId}/content`,
    { responseType: 'blob' },
  );

  return data;
};

const deleteImage = async (username, imageId) => {
  const { data } = await axios.delete(
    `${BASE_URL}/${username}/images/${imageId}`,
  );

  return data;
};

export default {
  createImage,
  getImages,
  getImage,
  getImageContent,
  deleteImage,
};
