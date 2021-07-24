const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const search = require('youtube-search');
const he = require('he');

/**
 * Calypso's Youtube command
 * @extends Command
 */
class Youtube extends Command {

  /**
   * Creates instance of Youtube command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'youtube',
      aliases: ['yt'],
      usage: 'youtube <video name>',
      description: 'Searches YouTube for the specified video.',
      type: client.types.FUN,
      examples: ['youtube That\'s a ten']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, member, author } = message;
    const { MISSING_ARG, INVALID_ARG, COMMAND_FAIL } = this.errorTypes;

    // Get video name
    const videoName = args.join(' ');
    if (!videoName) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a YouTube video name');

    const apiKey = client.apiKeys.googleApi; // Get API key

    const searchOptions = { maxResults: 1, key: apiKey, type: 'video' };
    if (!channel.nsfw) searchOptions['safeSearch'] = 'strict';

    // Fetch video
    let result = await search(videoName, searchOptions)
      .catch(err => { // Error during fetch
        client.logger.error(err);
        return this.sendErrorMessage(message, COMMAND_FAIL, 'Please try again in a few seconds', err.message);
      });
    result = result.results[0];

    // No video found
    if (!result) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'Unable to find video, please provide a different YouTube video name'
      );
    }

    const decodedTitle = he.decode(result.title); // Fix title
    const embed = new MessageEmbed()
      .setTitle(decodedTitle)
      .setURL(result.link)
      .setThumbnail('https://cdn1.iconfinder.com/data/icons/logotypes/32/youtube-512.png')
      .setDescription(result.description)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    if (channel.nsfw) embed.setImage(result.thumbnails.high.url); // Only allow thumbnails in nsfw channels
    channel.send(embed);
  }
}

module.exports = Youtube;
