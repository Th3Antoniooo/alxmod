const { Sequelize } = require('sequelize');
const { readdirSync } = require('fs');
const { join, resolve } = require('path');

class Database {
  constructor(client, dbConfig) {
    this._client = client;
    this._logger = client.logger;
    this.sequelize = new Sequelize('data', null, null, dbConfig);
    this.models = this.sequelize.models;
  }

  _loadModels(path) {
    const models = readdirSync(resolve(__basedir, path)).filter(f => f.endsWith('.js'));

    this._logger.info('Creating tables...');

    // Initialize all models
    for (let model of models) {
      require(resolve(__basedir, join(path, model)))(this.sequelize);
    }

    this._logger.info('Finished creating tables');
  }

  // Connect to database
  async _connect() {
    try {
      await this.sequelize.authenticate();
    } catch (err) {
      this._logger.error(err.stack);
    }
  }

  // Sync models
  async _sync() {
    // Sync all models
    try {
      await this.sequelize.sync();
    } catch (err) {
      this._logger.error(err.stack);
    }
  }

  // Reset the database
  async reset() {
    try {
      // DANGER ZONE -- This will drop all tables
      await this.sequelize.sync({ force: true });
    } catch (err) {
      this._logger.error(err.stack);
    }
  }

  // Handle all associations
  _associate() {

    // Snag models
    const { Guild, GuildConfig, GuildMember, User } = this.models;

    // A guild has one configuration
    Guild.hasOne(GuildConfig, { foreignKey: 'id' });

    // A guild configuration belongs to one guild
    GuildConfig.belongsTo(Guild, { foreignKey: 'id' });

    // A guild member belongs to one guild
    GuildMember.belongsTo(Guild, { foreignKey: 'guildId', onDelete: 'cascade' });

    // A guild member belongs to one user
    GuildMember.belongsTo(User, { foreignKey: 'userId', onDelete: 'cascade' });

  }

  async updateConfig(guildId, field, value) {
    const { GuildConfig } = this.models;

    const config = await GuildConfig.findOne({
      attributes: ['id', field],
      where: { id: guildId }
    });

    config[field] = value;
    config.save();

    this._client.configs.update(guildId, field, value);
  }

  async init(path) {
    await this._connect();
    this._loadModels(path);
    this._associate();
    await this._sync();
  }
}

module.exports = Database;
