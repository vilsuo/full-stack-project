import axios from 'axios';

const BASE_URL = '/api/users';

const getTargetRelations = async (username, queryParams) => {
  const { data } = await axios.get(
    `${BASE_URL}/${username}/relations`,
    { params: queryParams }
  );
  return data;
};

const addRelation = async (username, targetUserId, type) => {
  const { data } = await axios.post(
    `${BASE_URL}/${username}/relations`,
    { targetUserId, type },
    { withCredentials: true }
  );
  return data;
};

const removeRelation = async (username, relationId) => {
  const { data } = await axios.delete(
    `${BASE_URL}/${username}/relations/${relationId}`,
    { withCredentials: true }
  );
  return data;
};

export default {
  getTargetRelations,
  addRelation,
  removeRelation
};