const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's CoinFlip command
 * @extends Command
 */
class CoinFlip extends Command {

  /**
   * Creates instance of CoinFlip command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'coinflip',
      aliases: ['cointoss', 'coin', 'flip'],
      usage: 'coinflip',
      description: 'Flips a coin.',
      type: client.types.FUN
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message) {

    const { guild, channel, member, author } = message;

    // Flip coin
    const n = Math.floor(Math.random() * 2);
    let result;
    if (n === 1) result = 'heads';
    else result = 'tails';

    const embed = new MessageEmbed()
      .setTitle('🪙  Coinflip  🪙')
      .setDescription(`I flipped a coin for you, ${member}. It was **${result}**!`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = CoinFlip;
