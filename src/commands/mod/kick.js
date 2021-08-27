const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Kick command
 * @extends Command
 */
class Kick extends Command {

  /**
   * Creates instance of Kick command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'kick',
      usage: 'kick <user mention/ID> [reason]',
      description: 'Kicks a member from your server.',
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'KICK_MEMBERS'],
      userPermissions: ['KICK_MEMBERS'],
      examples: ['kick @Nettles']
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
        message, INVALID_ARG, 'You cannot kick someone with an equal or higher role'
      );
    }

    // Self kick attempt
    if (member === message.member) return this.sendErrorMessage(message, INVALID_ARG, 'You cannot kick yourself');

    // Member is not kickable
    if (!member.kickable) return this.sendErrorMessage(message, INVALID_ARG, 'Provided member is not kickable');

    // Reason
    let reason = args.slice(1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    await member.kick({ reason: reason });

    const embed = new MessageEmbed()
      .setTitle('Kick Member')
      .setDescription(`${member} was successfully kicked.`)
      .addField('Moderator', message.member, true)
      .addField('Member', member, true)
      .addField('Reason', reason)
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
    client.logger.info(`${guild.name}: ${author.tag} kicked ${member.user.tag}`);

    // Update mod log
    this.sendModLogMessage(message, reason, { Member: member });
  }
}

module.exports = Kick;
