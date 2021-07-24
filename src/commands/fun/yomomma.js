const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { oneLine } = require('common-tags');

/**
 * Calypso's YoMomma command
 * @extends Command
 */
class YoMomma extends Command {

  /**
   * Creates instance of YoMomma command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'yomomma',
      aliases: ['yourmom', 'yomamma', 'yomama', 'ym'],
      usage: 'yomomma [user mention/ID]',
      description: oneLine`
        Says a random "yo momma" joke to the specified user. 
        If no user is given, then the joke will be directed at you!
      `,
      type: client.types.FUN,
      examples: ['yomomma @Nettles'],
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

    const { client, guild, channel, author } = message;

    // Get member
    const member = this.getMemberFromMention(message, args[0]) ||
      guild.members.cache.get(args[0]) ||
      message.member;

    // Fetch joke
    try {
      const res = await fetch('https://api.yomomma.info');
      let joke = (await res.json()).joke;
      joke = joke.charAt(0).toLowerCase() + joke.slice(1);
      if (!joke.endsWith('!') && !joke.endsWith('.') && !joke.endsWith('"')) joke += '!'; // Cleanup joke
      const embed = new MessageEmbed()
        .setTitle('🍼  Yo Momma  🍼')
        .setDescription(`${member}, ${joke}`)
        .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
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

module.exports = YoMomma;
