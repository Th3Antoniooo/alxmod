const { DataTypes, Model } = require('sequelize');

class Warn extends Model {}

module.exports = (sequelize) => {
  Warn.init({
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
    mod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    reason: DataTypes.STRING,
  }, {
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'guild_id']
      }
    ],
    tableName: 'warns',
    underscored: true,
    sequelize
  });
};
