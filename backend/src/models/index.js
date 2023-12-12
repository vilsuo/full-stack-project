const User = require('./user');
const Image = require('./image');

User.hasMany(Image);
Image.belongsTo(User);

/*
The alias of this model, in singular form. See also the name option passed
to sequelize.define. If you create multiple associations between the same
tables, you should provide an alias to be able to distinguish between them.
If you provide an alias when creating the association, you should provide
the same alias when eager loading and when getting associated models. Defaults
to the singularized name of target
*/

//Profile.belongsTo(User) // This will add imageId to the user table
User.belongsTo(Image, { as: 'picture', foreignKey: 'imageId' });

module.exports = {
  User,
  Image,
};