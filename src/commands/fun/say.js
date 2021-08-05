const Command = require('../Command.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's Say command
 * @extends Command
 */
class Say extends Command {

  /**
   * Creates instance of Say command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'say',
      usage: 'say [channel mention/ID] <message>',
      description: oneLine`
        Sends a message to the specified channel. 
        If no channel is given, then the message will be sent to the current channel.
      `,
      type: client.types.FUN,
      examples: ['say #general hello world']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { client, guild, member, content } = message;
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;

    // Get channel
    let channel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);
    if (channel) {
      args.shift();
    } else channel = message.channel;

    // Check if Calypso has access to the channel
    if (!channel.permissionsFor(guild.me).has(['SEND_MESSAGES'])) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'I do not have permission to send messages in the provided channel'
      );
    }

    // Check user permissions
    if (!channel.permissionsFor(member).has(['SEND_MESSAGES'])) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'You do not have permission to send messages in the provided channel'
      );
    }

    // Check if channel is mod only
    const modOnlyChannels = client.configs.get(guild.id).modOnlyChannels;
    if (modOnlyChannels.includes(channel)) {
      return this.sendErrorMessage(
        message, INVALID_ARG, oneLine`
          Provided channel is moderator only,
          please mention an accessible text channel or provide a valid text channel ID
      `);
    }

    // No message provided
    if (!args[0]) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a message for me to say');

    // Send message
    const msg = content.slice(content.indexOf(args[0]), content.length);
    channel.send(msg, { disableMentions: 'everyone' });
  }
}

module.exports = Say;
