const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

/**
 * Calypso's Bird command
 * @extends Command
 */
class Bird extends Command {

  /**
   * Creates instance of Bird command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'bird',
      usage: 'bird',
      description: 'Finds a random bird for your viewing pleasure.',
      type: client.types.FUN,
      cooldown: 5
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message) {

    const { client, guild, channel, member, author } = message;

    try {

      // Fetch image
      const res = await fetch('http://shibe.online/api/birds');
      const img = (await res.json())[0];

      const embed = new MessageEmbed()
        .setTitle('🐦  Chirp!  🐦')
        .setImage(img)
        .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      channel.send(embed);

    // Error during fetch
    } catch (err) {
      client.logger.error(err.stack);
      this.sendErrorMessage(message, this.errorTypes.COMMAND_FAIL, 'Please try again in a few seconds', err.message);
    }
  }
}

module.exports = Bird;
