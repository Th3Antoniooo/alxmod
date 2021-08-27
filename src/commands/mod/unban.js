const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const rgx = /^(?:<@!?)?(\d+)>?$/;

/**
 * Calypso's Unban command
 * @extends Command
 */
class Unban extends Command {

  /**
   * Creates instance of Unban command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'unban',
      usage: 'unban <user ID> [reason]',
      description: 'Unbans a member from your server.',
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'BAN_MEMBERS'],
      userPermissions: ['BAN_MEMBERS'],
      examples: ['unban 134672335474130944']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, member, author } = message;
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;
    const none = '`None`';

    const id = args[0];
    if (!rgx.test(id)) {
      return this.sendErrorMessage(message, !id ? MISSING_ARG : INVALID_ARG, 'Please provide a valid user ID');
    }
    const bannedUsers = await guild.fetchBans();
    const user = bannedUsers.get(id).user;
    if (!user) return this.sendErrorMessage(message, INVALID_ARG, 'Unable to find user, please check the provided ID');

    // Reason
    let reason = args.slice(1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    await guild.members.unban(user, reason);
    const embed = new MessageEmbed()
      .setTitle('Unban Member')
      .setDescription(`${user.tag} was successfully unbanned.`)
      .addField('Moderator', member, true)
      .addField('Member', user.tag, true)
      .addField('Reason', reason)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    channel.send(embed);
    client.logger.info(`${guild.name}: ${author.tag} unbanned ${user.tag}`);

    // Update mod log
    this.sendModLogMessage(message, reason, { Member: user.tag });
  }
}

module.exports = Unban;
