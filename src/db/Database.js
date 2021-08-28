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

  // Configure database
  async _configure() {
    await this.sequelize.query('PRAGMA journal_mode = WAL;');
    await this.sequelize.query('PRAGMA synchronous = 1;');
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
    const { Guild, GuildConfig, GuildMember, User, ModOnlyChannel, Warn } = this.models;

    // A guild has one config
    // A guild config belongs to one guild
    Guild.hasOne(GuildConfig, { foreignKey: 'id' });
    GuildConfig.belongsTo(Guild, { foreignKey: 'id' });

    // A guild has many guild members
    // A guild member belongs to one guild
    Guild.hasMany(GuildMember, { foreignKey: 'guildId' });
    GuildMember.belongsTo(Guild, { foreignKey: 'guildId', onDelete: 'cascade' });

    // A user has many guild members
    // A guild member belongs to one user
    User.hasMany(GuildMember, { foreignKey: 'userId' });
    GuildMember.belongsTo(User, { foreignKey: 'userId', onDelete: 'cascade' });

    // A guild config has many mod only channels
    // A mod only channel belongs to one guild config
    GuildConfig.hasMany(ModOnlyChannel, { foreignKey: 'guildId' });
    ModOnlyChannel.belongsTo(GuildConfig, { foreignKey: 'guildId', onDelete: 'cascade' });

    // A guild member has many warns
    // A warn belongs to one guild member
    GuildMember.hasMany(Warn, { foreignKey: 'guildMemberId' });
    Warn.belongsTo(GuildMember, { foreignKey: 'guildMemberId', onDelete: 'cascade' });

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
    await this._configure();
    this._loadModels(path);
    this._associate();
    await this._sync();
  }
}

module.exports = Database;
