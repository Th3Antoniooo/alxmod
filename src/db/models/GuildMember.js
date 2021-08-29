const { DataTypes, Model } = require('sequelize');

class GuildMember extends Model {}

module.exports = (sequelize) => {
  GuildMember.init({
    id: { // Auto increment PK because Sequelize doesn't support referencing composite keys as FKs
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    guildId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    displayName: DataTypes.STRING,
    points: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    totalPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    totalCrowns: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: false
    },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'guild_id']
      }
    ],
    tableName: 'guild_members',
    underscored: true,
    sequelize
  });
};
