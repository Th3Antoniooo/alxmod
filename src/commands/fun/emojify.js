const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const numberMap = {
  '0': ':zero:',
  '1': ':one:',
  '2': ':two:',
  '3': ':three:',
  '4': ':four:',
  '5': ':five:',
  '6': ':six:',
  '7': ':seven:',
  '8': ':eight:',
  '9': ':nine:',
};

/**
 * Calypso's Emojify command
 * @extends Command
 */
class Emojify extends Command {

  /**
   * Creates instance of Emojify command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'emojify',
      aliases: ['sayemoji'],
      usage: 'emojify <message>',
      description: 'Swaps every letter within the provided message with an emoji.',
      type: client.types.FUN,
      examples: ['emojify hello world']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { guild, channel, member, author, content } = message;

    // No message provided
    if (!args[0]) {
      return this.sendErrorMessage(message, this.errorTypes.MISSING_ARG, 'Please provide a message to emojify');
    }

    // Emojify message
    let msg = content.slice(content.indexOf(args[0]), content.length);
    msg = msg.split('').map(c => {
      if (c === ' ') return c;
      else if (/[0-9]/.test(c)) return numberMap[c];
      else return (/[a-zA-Z]/.test(c)) ? ':regional_indicator_' + c.toLowerCase() + ':' : '';
    }).join('');

    // Trim message
    if (msg.length > 2048) {
      msg = msg.slice(0, msg.length - (msg.length - 2033));
      msg = msg.slice(0, msg.lastIndexOf(':')) + '**...**';
    }

    const embed = new MessageEmbed()
      .setTitle('Emojify')
      .setDescription(msg)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Emojify;
