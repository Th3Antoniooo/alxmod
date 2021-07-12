const { DataTypes, Model } = require('sequelize');

class User extends Model {}

module.exports = (sequelize) => {
  User.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    discriminator: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bot: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    tableName: 'users',
    underscored: true,
    sequelize
  });
};
