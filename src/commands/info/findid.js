const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's FindId command
 * @extends Command
 */
class FindId extends Command {

  /**
   * Creates instance of FindId command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'findid',
      aliases: ['find', 'id'],
      usage: 'findid <user/role/channel mention>',
      description: 'Finds the ID of the mentioned user, role, or text channel.',
      type: client.types.INFO,
      examples: ['findid @Nettles', 'findid #general']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    // Get target
    const target = this.getMemberFromMention(message, args[0]) ||
      this.getRoleFromMention(message, args[0]) ||
      this.getChannelFromMention(message, args[0]);

    // If no target is not valid
    const { INVALID_ARG, MISSING_ARG } = this.errorTypes;
    if (!target) {
      return this.sendErrorMessage(
        message, args[0] ? INVALID_ARG : MISSING_ARG, 'Please mention a user, role, or text channel'
      );
    }

    const { id } = target;
    const { guild, channel, member, author } = message;

    const embed = new MessageEmbed()
      .setTitle('Find ID')
      .addField('Target', target, true)
      .addField('ID', `\`${id}\``, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = FindId;
