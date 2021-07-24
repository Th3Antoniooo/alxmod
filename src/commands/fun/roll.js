const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Roll command
 * @extends Command
 */
class Roll extends Command {

  /**
   * Creates instance of Roll command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'roll',
      aliases: ['dice', 'r'],
      usage: 'roll <dice sides>',
      description: 'Rolls a die with the specified number of sides. Will default to 6 sides if no number is given.',
      type: client.types.FUN,
      examples: ['roll 20']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { guild, channel, member, author } = message;

    // Get limit
    let limit = args[0];
    if (!limit) limit = 6; // Default to 6

    // Get random number
    const n = Math.floor(Math.random() * limit + 1);

    // Invalid result or limit
    if (!n || limit <= 0) {
      return this.sendErrorMessage(
        message, this.errorTypes.INVALID_ARG, 'Please provide a valid number of dice sides'
      );
    }

    const embed = new MessageEmbed()
      .setTitle('🎲  Dice Roll  🎲')
      .setDescription(`${member}, you rolled a **${n}**!`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Roll;
