const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

const answers = [
  'It is certain.',
  'It is decidedly so.',
  'Without a doubt.',
  'Yes - definitely.',
  'You may rely on it.',
  'As I see it, yes.',
  'Most likely.',
  'Outlook good.',
  'Yes.',
  'Signs point to yes.',
  'Reply hazy, try again.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  'Don\'t count on it.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Very doubtful.'
];

/**
 * Calypso's EightBall command
 * @extends Command
 */
class EightBall extends Command {

  /**
   * Creates instance of EightBall command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: '8ball',
      aliases: ['fortune'],
      usage: '8ball <question>',
      description: 'Asks the Magic 8-Ball for some psychic wisdom.',
      type: client.types.FUN,
      examples: ['8ball Am I going to win the lottery?']
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

    const question = args.join(' ');
    if (!question) { // No question provided
      return this.sendErrorMessage(message, this.errorTypes.MISSING_ARG, 'Please provide a question to ask');
    }

    const embed = new MessageEmbed()
      .setTitle('🎱  The Magic 8-Ball  🎱')
      .addField('Question', question)
      .addField('Answer', `${answers[Math.floor(Math.random() * answers.length)]}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = EightBall;
