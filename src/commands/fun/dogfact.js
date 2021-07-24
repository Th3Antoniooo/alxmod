const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

/**
 * Calypso's DogFact command
 * @extends Command
 */
class DogFact extends Command {

  /**
   * Creates instance of DogFact command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'dogfact',
      aliases: ['df'],
      usage: 'dogfact',
      description: 'Says a random dog fact.',
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

    // Fetch fact
    try {
      const res = await fetch('https://dog-api.kinduff.com/api/facts');
      const fact = (await res.json()).facts[0];
      const embed = new MessageEmbed()
        .setTitle('🐶  Dog Fact  🐶')
        .setDescription(fact)
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

module.exports = DogFact;
