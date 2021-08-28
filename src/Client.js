const Discord = require('discord.js');
const Database = require('./db/Database.js');
const BotLogger = require('./BotLogger.js');
const ConfigCache = require('./ConfigCache.js');
const { readdirSync, readFileSync } = require('fs');
const { join, resolve } = require('path');
const Table = require('cli-table');
const chalk = require('chalk');
const YAML = require('yaml');
const { fail } = require('./utils/emojis.json');

/**
 * Calypso's Client class
 * @extends Discord.Client
 */
class Client extends Discord.Client {

  /**
   * @property {Logger} logger - The logger for the client
   * @property {Database} db - A wrapper around the Sequelize ORM
   * @property {BotLogger} botLogger - Handles all server bot log messages
   * @property {ConfigCache<string, GuildConfig>} configs - A cache where all guild configs are kept
   * @property {Object} types - All of the command categories
   * @property {Collection<string, Command>} commands - A Collection of commands, mapped by their name
   * @property {Collection<string, Command>} aliases - A Collection of aliases for commands, mapped by the alias
   * @property {Array<string>} topics - All of the trivia topics
   * @property {string} _token - The client's login token
   * @property {Object} apiKeys - All of the keys needed for third party APIs
   * @property {Array<string>} ownerIds - All of the IDs of the client's owner
   * @property {string} bugReportChannelId - The ID of the channel where bug reports are sent
   * @property {string} feedbackChannelId - The ID of the channel where feedback is sent
   * @property {string} serverLogChannelId - The ID of the channel where server join and leave logs are sent
   * @property {Object} utils - Various utility functions
   * @property {Object} errorTypes - All error types used for sending system error messages
   */

  /**
   * Creates instance of Client
   * @constructor
   * @param {Object} config - All client configuration options
   * @param {ClientOptions} options - ClientOptions that should be passed to the parent
   */
  constructor(config, options = {}) {

    super(options);

    /**
     * The client's logger
     * @type {Logger}
     */
    this.logger = require('./utils/logger.js');

    /**
     * The client's database
     * @type {Database}
     */
    this.db = new Database(this, config.dbConfig[config.env]);

    /**
     * The client's bot logger
     * @type {BotLogger}
     */
    this.botLogger = new BotLogger(this);

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
     * Array of trivia topics
     * @type {Array<string>}
     */
    this.topics = [];

    /**
     * The login token
     * @type {string}
     * @private
     */
    this._token = config.token;

    /**
     * All API keys
     * @type {Object}
     */
    this.apiKeys = config.apiKeys;

    /**
     * All owner IDs
     * @type {Array<string>}
     */
    this.ownerIds = config.ownerIds;

    /**
     * Bug report channel ID
     * @type {string}
     */
    this.bugReportChannelId = config.bugReportChannelId;

    /**
     * Feedback channel ID
     * @type {string}
     */
    this.feedbackChannelId = config.feedbackChannelId;

    /**
     * Server log channel ID
     * @type {string}
     */
    this.serverLogChannelId = config.serverLogChannelId;

    /**
     * Miscellaneous utility functions
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
   * @param {string} path - The path to the commands directory
   * @returns {undefined}
   * @private
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
          // Map commands
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
    return this; // Return this for chaining
  }

  /**
   * Loads all available events
   * @param {string} path - The path to the events directory
   * @returns {undefined}
   * @private
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
    return this; // Return this for chaining
  }

  /**
   * Loads all available actions
   * @param {string} path - The path to the actions directory
   * @returns {undefined}
   * @private
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
      this.logger.info(`Loaded ${files.length} action(s)`);
    }
    return this; // Return this for chaining
  }

  /**
   * Loads all available trivia topics
   * @param {string} path - The path to the trivia topic directory
   * @returns {undefined}
   * @private
   */
  _loadTriviaTopics(path) {

    this.logger.info('Loading topics...');
    const table = new Table({
      head: ['File', 'Name', 'Status'],
      chars: { 'mid': '', 'left-mid': '', 'mid-mid': '', 'right-mid': '' },
      style: {
        head: ['yellow']
      }
    });

    const files = readdirSync(path).filter(f => f.endsWith('.yml'));

    files.forEach(f => {
      try {
        YAML.parse(readFileSync(resolve(__basedir, join(path, f)), 'utf-8')); // Check if YAML is valid
        const topic = f.substring(0, f.indexOf('.'));
        this.topics.push(topic);
        table.push([f, topic, chalk['green']('pass')]);
      } catch (err) {
        this.logger.error(err.stack);
        this.logger.warn(`${f} failed to load`);
        table.push([f, '', chalk['red']('fail')]);
        return;
      }
    });

    if (files.length === 0) return this.logger.warn('No trivia topics found');
    else {
      this.logger.info(`\n${table.toString()}`);
      this.logger.info(`Loaded ${files.length} trivia topics(s)`);
    }

    return this; // Return this for chaining
  }

  /**
   * Checks if user is the bot owner
   * @param {User} user - The user that should be checked
   * @returns {boolean}
   */
  isOwner(user) {
    if (this.ownerIds.includes(user.id)) return true;
    else return false;
  }

  /**
   * Checks if a bot response can be sent to the channel
   * @param {Channel} channel - The channel that should be checked
   * @returns {boolean}
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
   * @param {Guild} guild - The guild that the message should be sent to
   * @param {string} error - The feature that the error occurred in
   * @param {string} errorType - The type of system error that should be sent
   * @param {string} [errorMessage] - Description of the error
   * @param {string} [stackTrace] - Stack trace of the error
   * @returns {undefined}
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
    this._loadTriviaTopics(resolve(__basedir, './data/trivia'));
    await this.db.init(resolve(__basedir, './src/db/models'));
    await this.login(this._token);
  }
}

module.exports = Client;
