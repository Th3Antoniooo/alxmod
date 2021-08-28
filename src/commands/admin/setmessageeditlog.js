const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetMessageEditLog command
 * @extends Command
 */
class SetMessageEditLog extends Command {

  /**
   * Creates instance of SetMessageEditLog command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setmessageeditlog',
      aliases: ['setmsgeditlog', 'setmel', 'smel'],
      usage: 'setmessageeditlog <channel mention/ID>',
      description: oneLine`
        Sets the message edit log text channel for your server. 
        Provide no channel to clear the current \`message edit log\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmessageeditlog #bot-log']
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
    const none = '`None`';

    const messageEditLogChannelId = client.configs.get(guild.id).messageEditLogChannelId;
    const oldMessageEditLogChannel = guild.channels.cache.get(messageEditLogChannelId) || none;

    let messageEditLogChannel;
    if (args.length === 0) messageEditLogChannel = none; // Clear if no args provided
    else messageEditLogChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(messageEditLogChannel) && messageEditLogChannel != none) {
      return this.sendErrorMessage(
        message,
        this.errorTypes.INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await client.db.updateConfig(guild.id, 'messageEditLogChannelId', messageEditLogChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Logging`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`message edit log\` was successfully updated. ${success}`)
      .addField('Message Edit Log', `${oldMessageEditLogChannel} ➔ ${messageEditLogChannel}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetMessageEditLog;
