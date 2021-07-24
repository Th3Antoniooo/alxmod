const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

/**
 * Calypso's TrumpTweet command
 * @extends Command
 */
class TrumpTweet extends Command {

  /**
   * Creates instance of TrumpTweet command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'trumptweet',
      aliases: ['trump'],
      usage: 'trumptweet <message>',
      description: 'Display\'s a custom tweet from Donald Trump with the message provided.',
      type: client.types.FUN,
      examples: ['trumptweet Calypso is the best Discord Bot!'],
      cooldown: 5
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, member, author, content } = message;
    const { MISSING_ARG, COMMAND_FAIL } = this.errorTypes;

    // Missing message
    if (!args[0]) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a message to tweet');

    // Trim messsage
    let tweet = content.slice(content.indexOf(args[0]), content.length);
    if (tweet.length > 68) tweet = tweet.slice(0, 65) + '...';

    // Fetch tweet
    try {
      const res = await fetch('https://nekobot.xyz/api/imagegen?type=trumptweet&text=' + tweet);
      const img = (await res.json()).message;
      const embed = new MessageEmbed()
        .setTitle('🇺🇸  Trump Tweet  🇺🇸')
        .setImage(img)
        .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      channel.send(embed);

    // Error during fetch
    } catch (err) {
      client.logger.error(err.stack);
      this.sendErrorMessage(message, COMMAND_FAIL, 'Please try again in a few seconds', err.message);
    }
  }
}

module.exports = TrumpTweet;
