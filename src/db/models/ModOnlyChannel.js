const { DataTypes, Model } = require('sequelize');

class ModOnlyChannel extends Model {}

module.exports = (sequelize) => {
  ModOnlyChannel.init({
    channelId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    name: DataTypes.STRING
  }, {
    tableName: 'mod_only_channels',
    underscored: true,
    sequelize
  });
};
