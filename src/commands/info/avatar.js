const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Avatar command
 * @extends Command
 */
class Avatar extends Command {

  /**
   * Creates instance of Avatar command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'avatar',
      aliases: ['profilepic', 'pic', 'ava'],
      usage: 'avatar [user mention/ID]',
      description: 'Displays a user\'s avatar (or your own, if no user is mentioned).',
      type: client.types.INFO,
      examples: ['avatar @Nettles']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { guild, channel, author } = message;

    // Get member
    const member = this.getMemberFromMention(message, args[0]) ||
      guild.members.cache.get(args[0]) ||
      message.member;

    // Display avatar
    const embed = new MessageEmbed()
      .setTitle(`${member.displayName}'s Avatar`)
      .setImage(member.user.displayAvatarURL({ dynamic: true, size: 512 }))
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(member.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Avatar;
