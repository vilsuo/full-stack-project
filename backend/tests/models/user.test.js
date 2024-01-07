const { User } = require('../../src/models');
const { nonExistingUserValues } = require('../helpers/constants');

const passwordService = require('../../src/util/password');

const encodePasswordSpy = jest.spyOn(passwordService, 'encodePassword');

const { password, ...rest } = nonExistingUserValues;
const userCreationValues = { ...rest, passwordHash: password };

describe('creating user with valid properties', () => {
  describe('password property', () => {
    test('created user does not have password property', async () => {
      const user = await User.create(userCreationValues);
    
      expect(user).not.toHaveProperty('password');
    
      const foundUser = await User.findByPk(user.id);
      expect(foundUser).not.toHaveProperty('password');
    });
    
    test('created users hashed password is not equal to users raw password', async () => {
      const user = await User.create(userCreationValues);
    
      expect(user.passwordHash).not.toBe(password);
    });
    
    test('when creating a user, the password hashing function is called', async () => {
      await User.create(userCreationValues);
      
      expect(encodePasswordSpy).toHaveBeenCalledWith(password);
    });
    
    test('when creating a user, the password hash matches the encoded version of the password', async () => {
      const user = await User.create(userCreationValues);
      
      const matches = await passwordService.comparePassword(password, user.passwordHash);
      expect(matches).toBe(true);
    });
  });

  describe('disabled property', () => {
    test('disablity is not specified, non-disabled user is created', async () => {
      expect(userCreationValues).not.toHaveProperty('disabled');

      const user = await User.create(userCreationValues);
      expect(user.disabled).toBe(false);
    });

    test('can create a user with positive disabled status', async () => {
      const disabledUserCreationValues = { ...userCreationValues, disabled: true };

      const user = await User.create(disabledUserCreationValues);
      expect(user.disabled).toBe(true);
    });
  });
});