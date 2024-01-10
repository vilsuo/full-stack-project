const { encodePassword, comparePassword } = require('../../src/util/password');

const rawPassword = 'åm90anp06qCWNRPT9cåm0C';

// see: https://www.npmjs.com/package/bcrypt#hash-info
test('encoded password is 60 characters long', async () => {
  const encodedPassword = await encodePassword(rawPassword);

  expect(encodedPassword.length).toBe(60);
});

test('encoded password is not equal to the raw password', async () => {
  const encodedPassword = await encodePassword(rawPassword);

  expect(encodedPassword).not.toBe(rawPassword);
});

test('raw password compares to encoded password', async () => {
  const encodedPassword = await encodePassword(rawPassword);

  const comparisonResult = await comparePassword(rawPassword, encodedPassword);
  expect(comparisonResult).toBe(true);
});

test('encoded password does not compare to itself', async () => {
  const encodedPassword = await encodePassword(rawPassword);

  const comparisonResult = await comparePassword(encodedPassword, encodedPassword);

  expect(comparisonResult).toBe(false);
});

test('equal passwords encoded are not equal', async () => {
  const firstEncodedPassword = await encodePassword(rawPassword);
  const secondEncodedPassword = await encodePassword(rawPassword);

  expect(secondEncodedPassword).not.toBe(firstEncodedPassword);
});