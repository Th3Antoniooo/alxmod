const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

/**
 * Calypso's CatFact command
 * @extends Command
 */
class CatFact extends Command {

  /**
   * Creates instance of CatFact command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'catfact',
      aliases: ['cf'],
      usage: 'catfact',
      description: 'Says a random cat fact.',
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
      const res = await fetch('https://catfact.ninja/fact');
      const fact = (await res.json()).fact;
      const embed = new MessageEmbed()
        .setTitle('🐱  Cat Fact  🐱')
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

module.exports = CatFact;
