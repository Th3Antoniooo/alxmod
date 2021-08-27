const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's Slowmode command
 * @extends Command
 */
class Slowmode extends Command {

  /**
   * Creates instance of Slowmode command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'slowmode',
      aliases: ['slow', 'sm'],
      usage: 'slowmode [channel mention/ID] <rate> [reason]',
      description: oneLine`
        Enables slowmode in a channel with the specified rate.
        If no channel is provided, then slowmode will affect the current channel.
        Provide a rate of 0 to disable.
      `,
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_CHANNELS'],
      userPermissions: ['MANAGE_CHANNELS'],
      examples: ['slowmode #general 2', 'slowmode 3']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, member, author } = message;
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;
    const none = '`None`';

    let index = 1;
    let channel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);
    if (!channel) {
      channel = message.channel;
      index--;
    }

    // Check channel
    if (!client.isAllowed(channel)) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'Please mention an accessible text channel or provide a valid text channel ID'
      );
    }

    // Get rate
    const rate = args[index];
    if (!rate || rate < 0 || rate > 59) {
      return this.sendErrorMessage(
        message, !rate ? MISSING_ARG : INVALID_ARG, 'Please provide a rate limit between 0 and 59 seconds'
      );
    }

    // Check channel permissions
    if (!channel.permissionsFor(guild.me).has(['MANAGE_CHANNELS'])) {
      return this.sendErrorMessage(message, INVALID_ARG, 'I do not have permission to manage the provided channel');
    }

    // Reason
    let reason = args.slice(index + 1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    await channel.setRateLimitPerUser(rate, reason); // set channel rate

    const status = (channel.rateLimitPerUser) ? 'enabled' : 'disabled';
    const embed = new MessageEmbed()
      .setTitle('Slowmode')
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    // Slowmode disabled
    if (rate === '0') {
      message.channel.send(embed
        .setDescription(`\`${status}\` ➔ \`disabled\``)
        .addField('Moderator', member, true)
        .addField('Channel', channel, true)
        .addField('Reason', reason)
      );

    // Slowmode enabled
    } else {

      message.channel.send(embed
        .setDescription(`\`${status}\` ➔ \`enabled\``)
        .addField('Moderator', member, true)
        .addField('Channel', channel, true)
        .addField('Rate', `\`${rate}\``, true)
        .addField('Reason', reason)
      );
    }

    // Update mod log
    this.sendModLogMessage(message, reason, { Channel: channel, Rate: `\`${rate}\`` });
  }
}

module.exports = Slowmode;
