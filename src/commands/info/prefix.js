const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Prefix command
 * @extends Command
 */
class Prefix extends Command {

  /**
   * Creates instance of Prefix command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'prefix',
      aliases: ['pre'],
      usage: 'prefix',
      description: 'Fetches Calypso\'s current prefix.',
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
    const { client, guild, channel, member, author } = message;
    const prefix = client.configs.get(guild.id).prefix; // Get prefix
    const embed = new MessageEmbed()
      .setTitle('Calypso\'s Prefix')
      .setThumbnail('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png')
      .addField('Prefix', `\`${prefix}\``, true)
      .addField('Example', `\`${prefix}ping\``, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Prefix;
