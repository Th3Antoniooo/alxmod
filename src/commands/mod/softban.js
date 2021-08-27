const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's SoftBan command
 * @extends Command
 */
class SoftBan extends Command {

  /**
   * Creates instance of SoftBan command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'softban',
      usage: 'softban <user mention/ID> [reason]',
      description: oneLine`
        Softbans a member from your server (bans then immediately unbans).
        This wipes all messages from that member from your server.      
      `,
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      examples: ['softban @Nettles']
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
        message, INVALID_ARG, 'You cannot softban someone with an equal or higher role'
      );
    }

    // Self softban attempt
    if (member === message.member) return this.sendErrorMessage(message, INVALID_ARG, 'You cannot softban yourself');

    // Member is not bannable
    if (!member.bannable) return this.sendErrorMessage(message, INVALID_ARG, 'Provided member is not bannable');

    // Reason
    let reason = args.slice(1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    await member.ban({ reason: reason });
    await message.guild.members.unban(member.user, reason);

    const embed = new MessageEmbed()
      .setTitle('Ban Member')
      .setDescription(`${member} was successfully softbanned.`)
      .addField('Moderator', message.member, true)
      .addField('Member', member, true)
      .addField('Reason', reason)
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
    client.logger.info(`${guild.name}: ${author.tag} softbanned ${member.user.tag}`);

    // Update mod log
    this.sendModLogMessage(message, reason, { Member: member });
  }
}

module.exports = SoftBan;
