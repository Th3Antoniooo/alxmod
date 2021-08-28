const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetFarewellChannel command
 * @extends Command
 */
class SetFarewellChannel extends Command {

  /**
   * Creates instance of SetFarewellChannel command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setfarewellchannel',
      aliases: ['setfc', 'sfc'],
      usage: 'setfarewellchannel <channel mention/ID>',
      description: oneLine`
        Sets the farewell message text channel for your server. 
        Provide no channel to clear the current \`farewell channel\`.
        A \`farewell message\` must also be set to enable farewell messages.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setfarewellchannel #general']
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

    const farewellChannelId = client.configs.get(guild.id).farewellChannelId;
    const oldFarewellChannel = guild.channels.cache.get(farewellChannelId) || none;
    let farewellMessage = client.configs.get(guild.id).farewellMessage;

    // Get status
    const oldStatus = getStatus(farewellChannelId, farewellMessage);

    // Trim message
    if (farewellMessage && farewellMessage.length > 1024) farewellMessage = farewellMessage.slice(0, 1021) + '...';

    // Clear if no args provided
    let farewellChannel;
    if (args.length === 0) farewellChannel = none;
    else farewellChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(farewellChannel) && farewellChannel != none) {
      return this.sendErrorMessage(
        message,
        INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update status
    const status = getStatus(farewellChannel.id, farewellMessage);
    const statusUpdate = (oldStatus != status) ? `${oldStatus} ➔ ${status}` : oldStatus;

    // Update config
    await client.db.updateConfig(guild.id, 'farewellChannelId', farewellChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Farewells`')
      .setDescription(`The \`farewell channel\` was successfully updated. ${success}`)
      .addField('Channel', `${oldFarewellChannel} ➔ ${farewellChannel}`, true)
      .addField('Status', statusUpdate, true)
      .addField('Message', replaceKeywords(farewellMessage) || none)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetFarewellChannel;
