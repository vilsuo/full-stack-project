const omit = require('lodash.omit');

const getNonSensitiveUser = user => {
  // do not return the passwordHash
  const values = omit(user.toJSON(), ['passwordHash']);
  values.createdAt = values.createdAt.toJSON();
  values.updatedAt = values.updatedAt.toJSON();

  return values;
};

const getNonSensitiveImage = image => {
  // do not return the filepath
  const values = omit(image.toJSON(), ['filepath']);
  if (values.editedAt) {
    values.editedAt = values.editedAt.toISOString();
  }
  values.createdAt = values.createdAt.toJSON();

  return values;
};

const getNonSensitivePotrait = potrait => {
  // do not return the filepath
  const values = omit(potrait.toJSON(), ['filepath']);
  values.createdAt = values.createdAt.toJSON();
  values.updatedAt = values.updatedAt.toJSON();

  return values;
};

module.exports = {
  getNonSensitiveUser,
  getNonSensitiveImage,
  getNonSensitivePotrait,
};