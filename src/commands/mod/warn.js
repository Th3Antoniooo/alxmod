const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');

/**
 * Calypso's Warn command
 * @extends Command
 */
class Warn extends Command {

  /**
   * Creates instance of Warn command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'warn',
      usage: 'warn <user mention/ID> [reason]',
      description: 'Warns a member in your server.',
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS'],
      examples: ['warn @Nettles']
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

    // Reason
    let reason = args.slice(1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    // Get model
    const { GuildMember } = client.db.models;
    const guildMember = await GuildMember.findOne({ where: { userId: member.id, guildId: guild.id }});

    // Create warning
    await guildMember.createWarn({
      mod: message.member.id,
      date:  moment().format('MMM DD YYYY'),
      reason: reason
    });

    // Get warns
    const warns = await guildMember.getWarns();

    const autoKick = client.configs.get(guild.id).autoKick; // Get warn # for auto kick

    const embed = new MessageEmbed()
      .setTitle('Warn Member')
      .setDescription(`${member} has been warned.`)
      .addField('Moderator', message.member, true)
      .addField('Member', member, true)
      .addField('Warn Count', `\`${warns.length}\``, true)
      .addField('Reason', reason)
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
    client.logger.info(`${guild.name}: ${author.tag} warned ${member.user.tag}`);

    // Update mod log
    this.sendModLogMessage(message, reason, { Member: member, 'Warn Count': `\`${warns.length}\`` });

    // Check for auto kick
    if (autoKick && warns.length === autoKick) {
      client.commands.get('kick')
        .run(message, [member.id, `Warn limit reached. Automatically kicked by ${guild.me}.`]);
    }
  }
}

module.exports = Warn;
