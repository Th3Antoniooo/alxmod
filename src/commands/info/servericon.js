const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's ServerIcon command
 * @extends Command
 */
class ServerIcon extends Command {

  /**
   * Creates instance of ServerIcon command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'servericon',
      aliases: ['icon', 'i'],
      usage: 'servericon',
      description: 'Displays the server\'s icon.',
      type: client.types.INFO
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message) {
    const { guild, channel, member, author } = message;
    const embed = new MessageEmbed()
      .setTitle(`${guild.name}'s Icon`)
      .setImage(guild.iconURL({ dynamic: true, size: 512 }))
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = ServerIcon;
