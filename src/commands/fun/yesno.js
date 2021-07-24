const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

/**
 * Calypso's YesNo command
 * @extends Command
 */
class YesNo extends Command {

  /**
   * Creates instance of YesNo command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'yesno',
      aliases: ['yn'],
      usage: 'yesno',
      description: 'Fetches a gif of a yes or a no.',
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

    // Fetch GIF
    try {
      const res = await (await fetch('http://yesno.wtf/api/')).json();

      // Get yes or no
      let answer = client.utils.capitalize(res.answer);
      if (answer === 'Yes') answer = '👍  ' + answer + '!  👍';
      else if (answer === 'No') answer = '👎  ' + answer + '!  👎';
      else answer = '👍  ' + answer + '...  👎';

      const img = res.image;
      const embed = new MessageEmbed()
        .setTitle(answer)
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

module.exports = YesNo;
