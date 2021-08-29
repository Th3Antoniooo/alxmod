const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's ClearWarns command
 * @extends Command
 */
class ClearWarns extends Command {

  /**
   * Creates instance of ClearWarns command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'clearwarns',
      usage: 'clearwarns <user mention/ID> [reason]',
      description: 'Clears all the warns of the provided member.',
      type: client.types.MOD,
      userPermissions: ['KICK_MEMBERS'],
      examples: ['clearwarns @Nettles']
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
        message, INVALID_ARG, 'You cannot clear the warns of someone with an equal or higher role'
      );
    }

    // Self warn clear attempt
    if (member === message.member) {
      return this.sendErrorMessage(message, INVALID_ARG, 'You cannot clear your own warns');
    }

    // Reason
    let reason = args.slice(1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    // Get model
    const { GuildMember, Warn } = client.db.models;
    const guildMemberId = await GuildMember.findOne({
      attributes: [['id', 'guildMemberId']], // Renames output
      where: { userId: member.id, guildId: guild.id },
      raw: true
    });

    // Clear warns
    // Would have just used guildMember.removeWarns() here but apparently that's broken too:
    // https://github.com/sequelize/sequelize/issues/4708
    await Warn.destroy({ where: guildMemberId });

    const embed = new MessageEmbed()
      .setTitle('Clear Warns')
      .setDescription(`${member}'s warns have been successfully cleared.`)
      .addField('Moderator', message.member, true)
      .addField('Member', member, true)
      .addField('Warn Count', '`0`', true)
      .addField('Reason', reason)
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
    client.logger.info(`${guild.name}: ${author.tag} cleared ${member.user.tag}'s warns`);

    // Update mod log
    this.sendModLogMessage(message, reason, { Member: member, 'Warn Count': '`0`' });
  }
}

module.exports = ClearWarns;
