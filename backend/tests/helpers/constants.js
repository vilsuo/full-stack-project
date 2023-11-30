
const existingUserValues = [
  {
    name: 'vili',
    username: 'ellivil',
    password: 'salainen'
  },
  {
    name: 'matias',
    username: 'matsu12',
    password: 'secret1'
  },
];

const existingDisabledUserValues = [
  {
    name: 'samuli',
    username: 'hemuli',
    password: 'password123',
    disabled: true,
  },
];

const nonExistingUserValues = [
  {
    name: 'miko',
    username: 'murmeli',
    password: 'qwerty',
  },
];

module.exports = {
  existingUserValues,
  existingDisabledUserValues,
  nonExistingUserValues,
};