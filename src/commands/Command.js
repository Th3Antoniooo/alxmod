const { MessageEmbed } = require('discord.js');
const permissions = require('../utils/permissions.json');
const { fail, timer } = require('../utils/emojis.json');

/**
 * Calypso's Command class
 */
class Command {

  /**
   * Create new command
   * @param {Client} client
   * @param {Object} options
   */
  constructor(client, options) {

    if (this.constructor == Command) throw new Error('The Command abstract class cannot be instantiated');

    // Validate all options passed
    this.constructor._validateOptions(client, options);

    /**
     * The client
     * @type {Client}
     */
    this.client = client;

    /**
     * Name of the command
     * @type {string}
     */
    this.name = options.name;

    /**
     * Aliases of the command
     * @type {Array<string>}
     */
    this.aliases = options.aliases || null;

    /**
     * The arguments for the command
     * @type {string}
     */
    this.usage = options.usage || options.name;

    /**
     * The description for the command
     * @type {string}
     */
    this.description = options.description || '';

    /**
     * The type of command
     * @type {string}
     */
    this.type = options.type || client.types.MISC;

    /**
     * The cooldown duration, in seconds
     * @type {int}
     */
    this.cooldown = options.cooldown || 0;

    /**
     * The client permissions needed
     * @type {Array<string>}
     */
    this.clientPermissions = options.clientPermissions || ['SEND_MESSAGES', 'EMBED_LINKS'];

    /**
     * The user permissions needed
     * @type {Array<string>}
     */
    this.userPermissions = options.userPermissions || null;

    /**
     * Examples of how the command is used
     * @type {Array<string>}
     */
    this.examples = options.examples || null;

    /**
     * If command can only be used by owner
     * @type {boolean}
     */
    this.ownerOnly = options.ownerOnly || false;

    /**
     * If command is enabled
     * @type {boolean}
     */
    this.disabled = options.disabled || false;

    /**
     * All active cooldowns
     * @type {boolean}
     * @private
     */
    this._cooldowns = new Map();

    /**
     * All possible command error types
     * @type {Object}
     */
    this.errorTypes = {
      MISSING_ARG: 'Missing Argument',
      INVALID_ARG: 'Invalid Argument',
      COMMAND_FAIL: 'Command Failure',
      MISSING_BOT_PERM: 'Missing Bot Permissions',
      MISSING_USER_PERM: 'Missing User Permissions'
    };
  }

  /**
   * Runs the command
   * @param {Message} message
   * @param {string[]} args
   */
  // eslint-disable-next-line no-unused-vars
  run(message, args) {
    throw new Error(`The ${this.name} command has no run() method`);
  }

  /**
   * Gets member from mention
   * @param {Message} message
   * @param {string} mention
   */
  getMemberFromMention(message, mention) {
    if (!mention) return;
    const matches = mention.match(/^<@!?(\d+)>$/);
    if (!matches) return;
    const id = matches[1];
    return message.guild.members.cache.get(id);
  }

  /**
   * Gets role from mention
   * @param {Message} message
   * @param {string} mention
   */
  getRoleFromMention(message, mention) {
    if (!mention) return;
    const matches = mention.match(/^<@&(\d+)>$/);
    if (!matches) return;
    const id = matches[1];
    return message.guild.roles.cache.get(id);
  }

  /**
   * Gets text channel from mention
   * @param {Message} message
   * @param {string} mention
   */
  getChannelFromMention(message, mention) {
    if (!mention) return;
    const matches = mention.match(/^<#(\d+)>$/);
    if (!matches) return;
    const id = matches[1];
    return message.guild.channels.cache.get(id);
  }

  /**
   * Helper method to check permissions
   * @param {Message} message
   * @param {boolean} ownerOverride
   */
  checkPermissions(message, ownerOverride = true) {
    const clientPermission = this.checkClientPermissions(message);
    const userPermission = this.checkUserPermissions(message, ownerOverride);
    if (clientPermission && userPermission) return true;
    else return false;
  }

  /**
   * Checks the client permissions
   * @param {Message} message
   * @param {boolean} ownerOverride
   */
  checkClientPermissions(message) {
    const { guild, channel } = message;
    let missingPermissions =
      channel.permissionsFor(guild.me).missing(this.clientPermissions).map(p => permissions[p]);
    if (missingPermissions.length !== 0) {
      missingPermissions = missingPermissions.map(p => `- ${p}`).join('\n').slice(2);
      this.sendErrorMessage(message, this.errorTypes.MISSING_BOT_PERM, missingPermissions);
      return false;

    } else return true;
  }

  /**
   * Checks the user permissions
   * Code modified from: https://github.com/discordjs/Commando/blob/master/src/commands/base.js
   * @param {Message} message
   * @param {boolean} ownerOverride
   */
  checkUserPermissions(message, ownerOverride = true) {
    const { channel, member, author } = message;
    if (!this.ownerOnly && !this.userPermissions) return true;
    if (ownerOverride && this.client.isOwner(author)) return true;
    if (this.ownerOnly && !this.client.isOwner(author)) {
      return false;
    }

    if (member.hasPermission('ADMINISTRATOR')) return true;
    if (this.userPermissions) {
      let missingPermissions =
        channel.permissionsFor(author).missing(this.userPermissions).map(p => permissions[p]);
      if (missingPermissions.length !== 0) {
        missingPermissions = missingPermissions.map(p => `- ${p}`).join('\n').slice(2);
        this.sendErrorMessage(message, this.errorTypes.MISSING_USER_PERM, missingPermissions);
        return false;
      }
    }
    return true;
  }

  /**
   * Gets or creates the cooldown for a current user
   * @param {string} userId
   */
  getOrCreateCooldown(userId) {
    if (this.cooldown <= 0 || this.client.isOwner(userId)) return null;

    let cooldown = this._cooldowns.get(userId);
    if (!cooldown) {
      cooldown = {
        start: Date.now(),
        timeout: this.client.setTimeout(() => {
          this._cooldowns.delete(userId);
        }, this.cooldown * 1000)
      };
      this._cooldowns.set(userId, cooldown);
      return null;
    }

    return cooldown;
  }

  /**
   * Creates and sends active cooldown embed
   * @param {Message} message
   */
  sendCooldownMessage(message, cooldown) {
    const { guild, channel, author } = message;
    const seconds = this.cooldown - Math.floor((Date.now() - cooldown.start) / 1000);
    const embed = new MessageEmbed()
      .setAuthor(`${author.tag}`, author.displayAvatarURL({ dynamic: true }))
      .setTitle(`${timer}  Active Cooldown: \`${this.name}\``)
      .setDescription(`This command is on cooldown for another \`${seconds}\` second${seconds != 1 ? 's' : ''}.`)
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }

  /**
   * Creates and sends command failure embed
   * @param {Message} message
   * @param {string} errorType
   * @param {string} errorMessage
   * @param {string} stackTrace
   */
  sendErrorMessage(message, errorType = this.errorTypes.INVALID_ARG, errorMessage = '', stackTrace = null) {
    const { guild, channel, client, author } = message;
    const { INVALID_ARG, MISSING_ARG, MISSING_BOT_PERM } = this.errorTypes;
    const prefix = this.client.configs.get(guild.id).prefix;
    const user = (errorType === MISSING_BOT_PERM) ? client.user : author;
    const embed = new MessageEmbed()
      .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
      .setTitle(`${fail}  Error: \`${this.name}\``)
      .setDescription(`\`\`\`diff\n+ ${errorType}\n- ${errorMessage}\`\`\``)
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    if (errorType === INVALID_ARG || errorType === MISSING_ARG) {
      embed.addField('Usage', `\`${prefix}${this.usage}\``);
      if (this.examples) embed.addField('Examples', this.examples.map(e => `\`${prefix}${e}\``).join('\n'));
    }
    if (stackTrace) embed.addField('Error Message', `\`\`\`${stackTrace}\`\`\``);
    channel.send(embed);
  }

  /**
   * Validates all options provided
   * Code modified from: https://github.com/discordjs/Commando/blob/master/src/commands/base.js
   * @param {Client} client
   * @param {Object} options
   */
  static _validateOptions(client, options) {

    if (!client) throw new Error('No client was found');
    if (typeof options !== 'object') throw new TypeError('Command options is not an Object');

    // Name
    if (typeof options.name !== 'string') throw new TypeError('Command name is not a string');
    if (options.name !== options.name.toLowerCase()) throw new Error('Command name is not lowercase');
    if (!options.name || /^\s*$/.test(options.name)) throw new Error('Command name is empty');

    // Aliases
    if (options.aliases) {
      if (!Array.isArray(options.aliases) || options.aliases.some(ali => typeof ali !== 'string'))
        throw new TypeError('Command aliases is not an Array of strings');

      if (options.aliases.some(ali => ali !== ali.toLowerCase()))
        throw new RangeError('Command aliases are not lowercase');

      for (const alias of options.aliases) {
        if (client.aliases.get(alias)) throw new Error('Command alias already exists');
      }
    }

    // Usage
    if (options.usage && typeof options.usage !== 'string') throw new TypeError('Command usage is not a string');

    // Description
    if (options.description && typeof options.description !== 'string')
      throw new TypeError('Command description is not a string');

    // Type
    if (options.type && typeof options.type !== 'string') throw new TypeError('Command type is not a string');
    if (options.type && !Object.values(client.types).includes(options.type))
      throw new Error('Command type is not valid');

    // Cooldown
    if (options.cooldown && typeof options.cooldown !== 'number')
      throw new TypeError('Command cooldown is not a number');

    // Client permissions
    if (options.clientPermissions) {
      if (!Array.isArray(options.clientPermissions))
        throw new TypeError('Command clientPermissions is not an Array of permission key strings');

      for (const perm of options.clientPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command clientPermission: ${perm}`);
      }
    }

    // User permissions
    if (options.userPermissions) {
      if (!Array.isArray(options.userPermissions))
        throw new TypeError('Command userPermissions is not an Array of permission key strings');

      for (const perm of options.userPermissions) {
        if (!permissions[perm]) throw new RangeError(`Invalid command userPermission: ${perm}`);
      }
    }

    // Examples
    if (options.examples && !Array.isArray(options.examples))
      throw new TypeError('Command examples is not an Array of permission key strings');

    // Owner only
    if (options.ownerOnly && typeof options.ownerOnly !== 'boolean')
      throw new TypeError('Command ownerOnly is not a boolean');

    // Disabled
    if (options.disabled && typeof options.disabled !== 'boolean')
      throw new TypeError('Command disabled is not a boolean');
  }
}

module.exports = Command;
