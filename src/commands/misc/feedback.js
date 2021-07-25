const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's Feedback command
 * @extends Command
 */
class Feedback extends Command {

  /**
   * Creates instance of Feedback command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'feedback',
      aliases: ['fb'],
      usage: 'feedback <message>',
      description: 'Sends a message to the Calypso Support Server\'s feedback channel.',
      type: client.types.MISC,
      examples: ['feedback We love Calypso!']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { client, guild, channel, member, author, content } = message;
    const { MISSING_ARG, COMMAND_FAIL } = this.errorTypes;

    // Get feedback channel
    const feedbackChannel = client.channels.cache.get(client.feedbackChannelId);
    if (!feedbackChannel) { // Property not set
      return this.sendErrorMessage(message, COMMAND_FAIL, 'The feedbackChannelId property has not been set');
    }

    // No feedback provided
    if (!args[0]) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a message to send');

    // Get feedback
    let feedback = content.slice(content.indexOf(args[0]), content.length);

    // Send report
    const feedbackEmbed = new MessageEmbed()
      .setTitle('Feedback')
      .setThumbnail(feedbackChannel.guild.iconURL({ dynamic: true }))
      .setDescription(feedback)
      .addField('User', member, true)
      .addField('Server', guild.name, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    feedbackChannel.send(feedbackEmbed);

    // Send response
    if (feedback.length > 1024) feedback = feedback.slice(0, 1021) + '...';
    const embed = new MessageEmbed()
      .setTitle('Feedback')
      .setThumbnail('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png')
      .setDescription(oneLine`
        Successfully sent feedback!
        Please join the [Calypso Support Server](https://discord.gg/pnYVdut) to further discuss your feedback.
      `)
      .addField('Member', member, true)
      .addField('Message', feedback)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Feedback;
