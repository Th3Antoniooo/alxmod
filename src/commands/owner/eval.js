const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Eval command
 * @extends Command
 */
class Eval extends Command {

  /**
   * Creates instance of Eval command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'eval',
      usage: 'eval <code>',
      description: 'Executes the provided code and shows output.',
      type: client.types.OWNER,
      ownerOnly: true,
      examples: ['eval 1 + 1']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    // Join args
    const input = args.join(' ');
    if (!input) return this.sendErrorMessage(message, this.errorTypes.MISSING_ARG, 'Please provide code to eval');

    const { channel } = message;

    // Evaluate code
    if (!input.toLowerCase().includes('token')) {

      const embed = new MessageEmbed();

      try {
        let output = eval(input);
        if (typeof output !== 'string') output = require('util').inspect(output, { depth: 0 });

        embed
          .addField('Input', `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
          .addField('Output', `\`\`\`js\n${output.length > 1024 ? 'Too large to display.' : output}\`\`\``)
          .setColor('#66FF00');

      } catch (err) {
        embed
          .addField('Input', `\`\`\`js\n${input.length > 1024 ? 'Too large to display.' : input}\`\`\``)
          .addField('Output', `\`\`\`js\n${err.length > 1024 ? 'Too large to display.' : err}\`\`\``)
          .setColor('#FF0000');
      }

      channel.send(embed);

    } else {
      channel.send('(╯°□°)╯︵ ┻━┻ MY token. **MINE**.'); // Just in case
    }
  }
}

module.exports = Eval;
