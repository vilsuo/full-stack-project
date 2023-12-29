const pick = require('lodash.pick');

const existingUserValues = {
  name: 'vili',
  username: 'ellivil',
  password: 'salainen'
};

const otherExistingUserValues = {
  name: 'matias',
  username: 'matsu12',
  password: 'secret1'
};

const disabledExistingUserValues = {
  name: 'samuli',
  username: 'hemuli',
  password: 'password123',
  disabled: true,
};

const nonExistingUserValues = {
  name: 'miko',
  username: 'murmeli',
  password: 'qwerty',
};

const getCredentials = userValues => {
  const { username, password } = userValues;

  return { username, password };
};

const existingUserImageValues = {
  publicImageValues: {
    title: 'Jest',
    caption: 'auth test results',
    mimetype: 'image/jpg',
    size: 46070,
    originalname: 'auth.JPG',
    filepath: 'tests/test-files/auth.JPG',
  },
  privateImageValues: {
    title: 'Psql',
    caption: 'relations',
    mimetype: 'image/png',
    size: 17391,
    originalname: 'table.JPG',
    filepath: 'tests/test-files/table.JPG',
  },
};

const otherExistingUserImageValues = {
  publicImageValues: {
    title: 'Git',
    caption: 'workflow graph',
    mimetype: 'image/png',
    size: 98099,
    originalname: 'git.png',
    filepath: 'tests/test-files/git.png',
  },
  privateImageValues: {
    title: 'Docker',
    caption: 'test containers',
    mimetype: 'image/png',
    size: 8894,
    originalname: 'docker.PNG',
    filepath: 'tests/test-files/docker.PNG',
  },
};

// used for posting only. parameter 'imagePath' is attached to the request
const nonExistingImageValues = {
  title: 'New',
  caption: 'testing posting',
  mimetype: 'image/png',
  originalname: 'new.PNG',
  size: 8183,
  filepath: 'tests/test-files/new.PNG',
};

const invalidImageTypes = [
  {
    filepath: 'tests/test-files/text.txt',
  },
];

const includeInPotrait = ['filepath', 'mimetype', 'size'];

const existingUserPotraitValues = pick(
  existingUserImageValues.publicImageValues, 
  includeInPotrait
);

const otherExistingUserPotraitValues = pick(
  otherExistingUserImageValues.publicImageValues, 
  includeInPotrait
);

const nonExistingPotraitValues = pick(
  nonExistingImageValues,
  includeInPotrait
);

const invalidPotraitTypes = invalidImageTypes;

module.exports = {
  // users
  existingUserValues,
  otherExistingUserValues,
  disabledExistingUserValues,
  nonExistingUserValues,
  getCredentials,

  // images
  existingUserImageValues,
  otherExistingUserImageValues,
  nonExistingImageValues,
  invalidImageTypes,

  // potraits
  existingUserPotraitValues,
  otherExistingUserPotraitValues,
  nonExistingPotraitValues,
  invalidPotraitTypes
};