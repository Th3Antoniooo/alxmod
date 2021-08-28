const { DataTypes, Model } = require('sequelize');

class ModOnlyChannel extends Model {}

module.exports = (sequelize) => {
  ModOnlyChannel.init({
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: DataTypes.STRING
  }, {
    tableName: 'mod_only_channels',
    underscored: true,
    sequelize
  });
};
