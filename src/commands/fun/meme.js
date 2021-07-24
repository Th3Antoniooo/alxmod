const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

/**
 * Calypso's Meme command
 * @extends Command
 */
class Meme extends Command {

  /**
   * Creates instance of Meme command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'meme',
      usage: 'meme',
      description: 'Displays a random meme from the `memes`, `dankmemes`, or `me_irl` subreddits.',
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

    // Fetch image
    try {
      let res = await fetch('https://meme-api.herokuapp.com/gimme');
      res = await res.json();
      const embed = new MessageEmbed()
        .setTitle(res.title)
        .setImage(res.url)
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

module.exports = Meme;
