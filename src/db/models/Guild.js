const { DataTypes, Model } = require('sequelize');

class Guild extends Model {}

module.exports = (sequelize) => {
  Guild.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ownerId: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'guilds',
    underscored: true,
    sequelize
  });
};
