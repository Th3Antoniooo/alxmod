const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const rps = ['scissors','rock', 'paper'];
const res = ['Scissors :v:','Rock :fist:', 'Paper :raised_hand:'];

/**
 * Calypso's RockPaperScissors command
 * @extends Command
 */
class RockPaperScissors extends Command {

  /**
   * Creates instance of RockPaperScissors command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'rps',
      usage: 'rps <rock | paper | scissors>',
      description: 'Play a game of rock–paper–scissors against Calypso!',
      type: client.types.FUN,
      examples: ['rps rock']
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
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;

    // Get user choice
    let userChoice;
    if (!args.length) userChoice = args[0].toLowerCase();

    // Invalid choice
    if (!rps.includes(userChoice)) {
      return this.sendErrorMessage(
        message, args[0] ? INVALID_ARG : MISSING_ARG, 'Please enter rock, paper, or scissors'
      );
    }

    // Get result
    userChoice = rps.indexOf(userChoice);
    const botChoice = Math.floor(Math.random()*3);
    let result;
    if (userChoice === botChoice) result = 'It\'s a draw!';
    else if (botChoice > userChoice || botChoice === 0 && userChoice === 2) result = '**Calypso** wins!';
    else result = `**${member.displayName}** wins!`;

    const embed = new MessageEmbed()
      .setTitle(`${member.displayName} vs. Calypso`)
      .addField('Your Choice:', res[userChoice], true)
      .addField('Calypso\'s Choice', res[botChoice], true)
      .addField('Result', result, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = RockPaperScissors;
