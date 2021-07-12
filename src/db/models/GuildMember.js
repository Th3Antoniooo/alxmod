const { DataTypes, Model } = require('sequelize');

class GuildMember extends Model {}

module.exports = (sequelize) => {
  GuildMember.init({
    userId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    guildId: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    nickname: DataTypes.STRING,
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'guild_members',
    underscored: true,
    sequelize
  });
};
