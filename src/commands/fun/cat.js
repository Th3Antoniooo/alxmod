const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

/**
 * Calypso's Cat command
 * @extends Command
 */
class Cat extends Command {

  /**
   * Creates instance of Cat command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'cat',
      aliases: ['kitten', 'kitty'],
      usage: 'cat',
      description: 'Finds a random cat for your viewing pleasure.',
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

    const apiKey = client.apiKeys.catApi; // Get API key

    // Fetch image
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': apiKey }});
      const img = (await res.json())[0].url;
      const embed = new MessageEmbed()
        .setTitle('🐱  Meow!  🐱')
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

module.exports = Cat;
