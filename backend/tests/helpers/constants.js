
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

8,894
const testImages = {
  jpg : [
    {
      title: 'Jest',
      caption: 'auth test results',
      mimetype: 'image/jpg',
      size: 46070,
      originalname: 'auth.JPG',
      filepath: 'tests/test-files/auth.JPG',
    },
    {
      title: 'Psql',
      caption: 'relations',
      mimetype: 'image/png',
      size: 6504,
      originalname: 'table.PNG',
      filepath: 'tests/test-files/table.PNG',
    }
  ],
  png: [
    {
      title: 'Git',
      caption: 'workflow graph',
      mimetype: 'image/png',
      size: 98099,
      originalname: 'git.png',
      filepath: 'tests/test-files/git.png',
    },
    {
      title: 'Docker',
      caption: 'test containers',
      mimetype: 'image/png',
      size: 8894,
      originalname: 'docker.PNG',
      filepath: 'tests/test-files/docker.PNG',
    }
  ],
};

module.exports = {
  existingUserValues,
  existingDisabledUserValues,
  nonExistingUserValues,
  testImages,
};