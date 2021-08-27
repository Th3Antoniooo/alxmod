const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Unmute command
 * @extends Command
 */
class Unmute extends Command {

  /**
   * Creates instance of Unmute command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'unmute',
      usage: 'unmute <user mention/ID>',
      description: 'Unmutes the specified user.',
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      examples: ['unmute @Nettles']
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
    const { MISSING_ARG, INVALID_ARG, COMMAND_FAIL } = this.errorTypes;
    const none = '`None`';

    const muteRoleId = client.configs.get(guild.id).muteRoleId;
    let muteRole;
    if (muteRoleId) muteRole = guild.roles.cache.get(muteRoleId); // Get mute role
    else return this.sendErrorMessage(message, COMMAND_FAIL, 'There is currently no mute role set on this server');

    const member = this.getMemberFromMention(message, args[0]) || guild.members.cache.get(args[0]);

    // Invalid or missing member
    if (!member) {
      return this.sendErrorMessage(
        message, !args[0] ? MISSING_ARG : INVALID_ARG, 'Please mention a user or provide a valid user ID'
      );
    }

    // Member role higher than mod
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return this.sendErrorMessage(message, INVALID_ARG, 'You cannot unmute someone with an equal or higher role');
    }

    // Reason
    let reason = args.slice(2).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    if (!member.roles.cache.has(muteRoleId)) {
      return this.sendErrorMessage(message, INVALID_ARG, 'Provided member is not muted');
    }

    // Unmute member
    client.clearTimeout(member.timeout);
    try {
      await member.roles.remove(muteRole);
      const embed = new MessageEmbed()
        .setTitle('Unmute Member')
        .setDescription(`${member} has been unmuted.`)
        .addField('Reason', reason)
        .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      channel.send(embed);
    } catch (err) {
      client.logger.error(err.stack);
      return this.sendErrorMessage(message, COMMAND_FAIL, 'Please check the role hierarchy', err.message);
    }

    // Update mod log
    this.sendModLogMessage(message, reason, { Member: member });
  }
}

module.exports = Unmute;
