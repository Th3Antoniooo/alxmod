const Discord = require('discord.js');
const Database = require('./db/Database.js');
const ConfigCache = require('./ConfigCache.js');
const { readdirSync } = require('fs');
const { join, resolve } = require('path');
const Table = require('cli-table');
const chalk = require('chalk');
const { fail } = require('./utils/emojis.json');

/**
 * Calypso's custom client
 * @extends Discord.Client
 */
class Client extends Discord.Client {

  /**
   * Create a new client
   * @param {Object} config
   * @param {ClientOptions} options
   */
  constructor(config, options = {}) {

    super(options);

    /**
     * Logger
     * @type {Object}
     */
    this.logger = require('./utils/logger.js');

    /**
     * Database
     * @type {Object}
     */
    this.db = new Database(this, config.dbConfig[config.env]);

    /**
     * Cache of all guild configurations
     * @type {ConfigCache<string, GuildConfig>}
     */
    this.configs = new ConfigCache();

    /**
     * All possible command types
     * @type {Object}
     */
    this.types = config.commandTypes;

    /**
     * Collection of bot commands
     * @type {Collection<string, Command>}
     */
    this.commands = new Discord.Collection();

    /**
     * Collection of command aliases
     * @type {Collection<string, Command>}
     */
    this.aliases = new Discord.Collection();

    /**
     * Login token
     * @type {string}
     */
    this._token = config.token;

    /**
     * All owner IDs
     * @type {Array<string>}
     */
    this.ownerIds = config.ownerIds;

    /**
     * Server log channel ID
     * @type {string}
     */
    this.serverLogChannelId = config.serverLogChannelId;

    /**
     * Utility functions
     * @type {Object}
     */
    this.utils = require('./utils/utils.js');

    /**
     * All possible system error types
     * @type {Object}
     */
    this.errorTypes = {
      MISSING_ROLE: 'Missing Role',
      ROLE_UPDATE: 'Role Update',
      CHANNEL_ACCESS: 'Channel Access',
    };

    this.logger.info('Initializing...');

  }

  /**
   * Loads all available commands
   * @param {string} path
   */
  _loadCommands(path) {

    this.logger.info('Loading commands...');
    const table = new Table({
      head: ['File', 'Name', 'Aliases', 'Type', 'Status'],
      chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: {
        head: ['yellow']
      }
    });

    readdirSync(path).filter(f => !f.endsWith('.js')).forEach(dir => {
      const commands = readdirSync(resolve(__basedir, join(path, dir))).filter(f => f.endsWith('js'));

      commands.forEach(f => {
        let command;
        try {
          const Command = require(resolve(__basedir, join(path, dir, f)));
          command = new Command(this); // Instantiate the specific command
        } catch (err) {
          this.logger.error(err.stack);
          this.logger.warn(`${f} failed to load`);
          table.push([f, '', '', '', chalk['red']('fail')]);
          return;
        }

        if (command.name && !command.disabled) {
          // Map command
          this.commands.set(command.name, command);
          // Map command aliases
          let aliases = '';
          if (command.aliases) {
            command.aliases.forEach(alias => {
              this.aliases.set(alias, command);
            });
            aliases = command.aliases.join(', ');
          }
          table.push([f, command.name, aliases, command.type, chalk['green']('pass')]);
        }
      });
    });

    if (this.commands.size === 0) this.logger.warn('No commands found');
    else {
      this.logger.info(`\n${table.toString()}`);
      this.logger.info(`Loaded ${this.commands.size} command(s)`);
    }
    return this;
  }

  /**
   * Loads all available events
   * @param {string} path
   */
  _loadEvents(path) {

    this.logger.info('Loading events...');
    const table = new Table({
      head: ['File', 'Name', 'Status'],
      chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: {
        head: ['yellow']
      }
    });

    const files = readdirSync(path).filter(f => f.endsWith('.js'));

    files.forEach(f => {
      const eventName = f.substring(0, f.indexOf('.'));

      try {
        const event = require(resolve(__basedir, join(path, f)));
        if (eventName === 'ready') super.once(eventName, event.bind(null, this));
        else super.on(eventName, event.bind(null, this));
        delete require.cache[require.resolve(resolve(__basedir, join(path, f)))]; // Clear cache
      } catch (err) {
        this.logger.error(err.stack);
        this.logger.warn(`${f} failed to load`);
        table.push([f, '', chalk['red']('fail')]);
        return;
      }

      table.push([f, eventName, chalk['green']('pass')]);
    });

    if (files.length === 0) this.logger.warn('No events found');
    else {
      this.logger.info(`\n${table.toString()}`);
      this.logger.info(`Loaded ${files.length} event(s)`);
    }
    return this;
  }

  /**
 * Loads all available actions
 * @param {string} path
 */
  _loadActions(path) {

    this.logger.info('Loading actions...');
    const table = new Table({
      head: ['File', 'Name', 'Status'],
      chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: {
        head: ['yellow']
      }
    });

    const files = readdirSync(path).filter(f => f.endsWith('.js'));

    files.forEach(f => {
      let actionName;

      try {
        const Action = require(resolve(__basedir, join(path, f)));
        const action = new Action(this);
        actionName = action.constructor.name;
        this.actions[actionName] = action;
      } catch (err) {
        this.logger.error(err.stack);
        this.logger.warn(`${f} failed to load`);
        table.push([f, '', chalk['red']('fail')]);
        return;
      }

      table.push([f, actionName, chalk['green']('pass')]);
    });

    if (files.length === 0) this.logger.warn('No actions found');
    else {
      this.logger.info(`\n${table.toString()}`);
      this.logger.info(`Loaded ${files.length} event(s)`);
    }
    return this;
  }

  /**
   * Checks if user is the bot owner
   * @param {User} user
   */
  isOwner(user) {
    if (this.ownerIds.includes(user.id)) return true;
    else return false;
  }

  /**
   * Checks if a bot response can be sent to the channel
   * @param {Channel} channel
   */
  isAllowed(channel) {
    if ( // Check channel and permissions
      !channel ||
      !channel.viewable ||
      !channel.permissionsFor(channel.guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) return false;
    else return true;
  }

  /**
   * Creates and sends system failure embed
   * @param {Guild} guild
   * @param {string} error
   * @param {string} errorType
   * @param {string} errorMessage
   * @param {string} stackTrace
   */
  sendSystemErrorMessage(guild, error, errorType, errorMessage = '', stackTrace = null) {

    // Get system channel
    const systemChannelId = this.configs.get(guild.id).systemChannelId;
    const systemChannel = guild.channels.cache.get(systemChannelId);

    if (!this.isAllowed(systemChannel)) return;

    const embed = new Discord.MessageEmbed()
      .setAuthor(`${this.user.tag}`, this.user.displayAvatarURL({ dynamic: true }))
      .setTitle(`${fail}  System Error: \`${error}\``)
      .setDescription(`\`\`\`diff\n+ ${errorType}\n+ ${errorMessage}\`\`\``)
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    if (stackTrace) embed.addField('Error Message', `\`\`\`${stackTrace}\`\`\``);
    systemChannel.send(embed);
  }

  /**
   * Initializes the client
   * @param {string} path
   */
  async init() {
    this._loadCommands(resolve(__basedir, './src/commands'));
    this._loadEvents(resolve(__basedir, './src/events'));
    this._loadActions(resolve(__basedir, './src/actions'));
    await this.db.init(resolve(__basedir, './src/db/models'));
    await this.login(this._token);
  }
}

module.exports = Client;
