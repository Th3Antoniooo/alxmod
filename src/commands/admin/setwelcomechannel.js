const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetWelcomeChannel command
 * @extends Command
 */
class SetWelcomeChannel extends Command {

  /**
   * Creates instance of SetWelcomeChannel command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setwelcomechannel',
      aliases: ['setwc', 'swc'],
      usage: 'setwelcomechannel <channel mention/ID>',
      description: oneLine`
        Sets the welcome message text channel for your server. 
        Provide no channel to clear the current \`welcome channel\`.
        A \`welcome message\` must also be set to enable welcome messages.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setwelcomechannel #general']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, member, author } = message;
    const { getStatus, replaceKeywords } = client.utils;
    const { INVALID_ARG } = this.errorTypes;
    const none = '`None`';

    const welcomeChannelId = client.configs.get(guild.id).welcomeChannelId;
    const oldWelcomeChannel = guild.channels.cache.get(welcomeChannelId) || none;
    let welcomeMessage = client.configs.get(guild.id).welcomeMessage;

    // Get status
    const oldStatus = getStatus(welcomeChannelId, welcomeMessage);

    // Trim message
    if (welcomeMessage && welcomeMessage.length > 1024) welcomeMessage = welcomeMessage.slice(0, 1021) + '...';

    // Clear if no args provided
    let welcomeChannel;
    if (args.length === 0) welcomeChannel = none;
    else welcomeChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(welcomeChannel) && welcomeChannel != none) {
      return this.sendErrorMessage(
        message,
        INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update status
    const status = getStatus(welcomeChannel.id, welcomeMessage);
    const statusUpdate = (oldStatus != status) ? `${oldStatus} ➔ ${status}` : oldStatus;

    // Update config
    await client.db.updateConfig(guild.id, 'welcomeChannelId', welcomeChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Welcomes`')
      .setDescription(`The \`welcome channel\` was successfully updated. ${success}`)
      .addField('Channel', `${oldWelcomeChannel} ➔ ${welcomeChannel}`, true)
      .addField('Status', statusUpdate, true)
      .addField('Message', replaceKeywords(welcomeMessage) || none)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetWelcomeChannel;
