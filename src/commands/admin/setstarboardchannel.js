const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetStarboardChannel command
 * @extends Command
 */
class SetStarboardChannel extends Command {

  /**
   * Creates instance of SetStarboardChannel command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setstarboardchannel',
      aliases: ['setstc', 'sstc'],
      usage: 'setstarboardchannel <channel mention/ID>',
      description: oneLine`
        Sets the starboard text channel for your server.
        Provide no channel to clear the current \`starboard channel\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setstarboardchannel #starboard']
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
    const { INVALID_ARG } = this.errorTypes;
    const none = '`None`';

    // Get old channel
    const starboardChannelId = client.configs.get(guild.id).starboardChannelId;
    const oldStarboardChannel = guild.channels.cache.get(starboardChannelId) || none;

    // Clear if no args provided
    let starboardChannel;
    if (args.length === 0) starboardChannel = none;
    else starboardChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(starboardChannel) && starboardChannel != none) {
      return this.sendErrorMessage(
        message,
        INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await client.db.updateConfig(guild.id, 'starboardChannelId', starboardChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`starboard channel\` was successfully updated. ${success}`)
      .addField('Starboard Channel', `${oldStarboardChannel} ➔ ${starboardChannel}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetStarboardChannel;
