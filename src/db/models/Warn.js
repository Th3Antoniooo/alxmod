const { DataTypes, Model } = require('sequelize');

class Warn extends Model {}

module.exports = (sequelize) => {
  Warn.init({
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    guildMemberId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    mod: {
      type: DataTypes.STRING,
      allowNull: false
    },
    date: {
      type: DataTypes.STRING,
      allowNull: false
    },
    reason: DataTypes.STRING,
  }, {
    tableName: 'warns',
    underscored: true,
    sequelize
  });
};
