const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Blast command
 * @extends Command
 */
class Blast extends Command {

  /**
   * Creates instance of Blast command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'blast',
      usage: 'blast <message>',
      description: 'Sends a message to every server that has a system channel.',
      type: client.types.OWNER,
      ownerOnly: true,
      examples: ['blast Hello World!']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    // If no argument provided
    const { MISSING_ARG } = this.errorTypes;
    if (!args[0]) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a message to blast');

    const { client, guild, channel, member, author, content } = message;
    const msg = content.slice(content.indexOf(args[0]), content.length);
    const guilds = []; // Guilds where blast failed

    // Loop through guilds
    client.guilds.cache.forEach(guild => {

      // Get system channel
      const systemChannelId = client.configs.get(guild.id).systemChannelId;
      const systemChannel = guild.channels.cache.get(systemChannelId);

      if (client.isAllowed(systemChannel)) {
        const embed = new MessageEmbed()
          .setTitle('Calypso System Message')
          .setThumbnail('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png')
          .setDescription(msg)
          .setTimestamp()
          .setColor(guild.me.displayHexColor);
        systemChannel.send(embed);
      } else guilds.push(guild.name); // Add guild
    });

    if (guilds.length > 0) {
      // Trim array
      const description = client.utils.trimStringFromArray(guilds);

      const embed = new MessageEmbed()
        .setTitle('Blast Failures')
        .setDescription(description)
        .setFooter(member.displayName,  author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      channel.send(embed);
    }
  }
}

module.exports = Blast;
