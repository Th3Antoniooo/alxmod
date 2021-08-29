const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

/**
 * Calypso's WarnPurge command
 * @extends Command
 */
class WarnPurge extends Command {

  /**
   * Creates instance of WarnPurge command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'warnpurge',
      aliases: ['purgewarn'],
      usage: 'warnpurge <user mention/ID> <message count> [reason]',
      description: 'Warns a member in your server and then purges their messages from the message count provided.',
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS', 'MANAGE_MESSAGES'],
      userPermissions: ['KICK_MEMBERS', 'MANAGE_MESSAGES'],
      examples: ['warnpurge @Nettles 50']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, author } = message;
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;
    const none = '`None`';

    const member = this.getMemberFromMention(message, args[0]) || guild.members.cache.get(args[0]);

    // Invalid or missing member
    if (!member) {
      return this.sendErrorMessage(
        message, !args[0] ? MISSING_ARG : INVALID_ARG, 'Please mention a user or provide a valid user ID'
      );
    }

    // Member role higher than mod
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'You cannot warn someone with an equal or higher role'
      );
    }

    // Self warn attempt
    if (member === message.member) return this.sendErrorMessage(message, INVALID_ARG, 'You cannot warn yourself');

    // Get amount
    const amount = parseInt(args[1]);
    if (isNaN(amount) === true || !amount || amount < 0 || amount > 100) {
      return this.sendErrorMessage(
        message, !args[1] ? MISSING_ARG : INVALID_ARG, 'Please provide a message count between 1 and 100'
      );
    }

    // Reason
    let reason = args.slice(1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    // Get model
    const { Warn } = client.db.models;

    // Create warning
    await Warn.create({
      userId: member.id,
      guildId: guild.id,
      mod: message.member.id,
      date:  moment().format('MMM DD YYYY'),
      reason: reason
    });

    // Get warns
    const warns = await Warn.findAll({ where: { userId: member.id, guildId: guild.id }});

    const autoKick = client.configs.get(guild.id).autoKick; // Get warn # for auto kick

    // Purge
    const messages = (await channel.messages.fetch({ limit: amount })).filter(m => m.member.id === member.id);
    if (messages.size > 0) await channel.bulkDelete(messages, true);

    const embed = new MessageEmbed()
      .setTitle('Warnpurge Member')
      .setDescription(`${member} has been warned, with **${messages.size}** messages purged.`)
      .addField('Moderator', message.member, true)
      .addField('Member', member, true)
      .addField('Warn Count', `\`${warns.warns.length}\``, true)
      .addField('Found Messages', `\`${messages.size}\``, true)
      .addField('Reason', reason)
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
    client.logger.info(`${guild.name}: ${author.tag} warnpurged ${member.user.tag}`);

    // Update mod log
    this.sendModLogMessage(message, reason, {
      Member: member,
      'Warn Count': `\`${warns.warns.length}\``,
      'Found Messages': `\`${messages.size}\``
    });

    // Check for auto kick
    if (autoKick && warns.warns.length === autoKick) {
      client.commands.get('kick')
        .run(message, [member.id, `Warn limit reached. Automatically kicked by ${guild.me}.`]);
    }

  }
}

module.exports = WarnPurge;
