const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetMessageDeleteLog command
 * @extends Command
 */
class SetMessageDeleteLog extends Command {

  /**
   * Creates instance of SetMessageDeleteLog command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setmessagedeletelog',
      aliases: ['setmsgdeletelog', 'setmdl', 'smdl'],
      usage: 'setmessagedeletelog <channel mention/ID>',
      description: oneLine`
        Sets the message delete log text channel for your server. 
        Provide no channel to clear the current \`message delete log\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmessagedeletelog #bot-log']
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

    const messageDeleteLogChannelId = client.configs.get(guild.id).messageDeleteLogChannelId;
    const oldMessageDeleteLogChannel = guild.channels.cache.get(messageDeleteLogChannelId) || none;

    let messageDeleteLogChannel;
    if (args.length === 0) messageDeleteLogChannel = none; // Clear if no args provided
    else messageDeleteLogChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(messageDeleteLogChannel) && messageDeleteLogChannel != none) {
      return this.sendErrorMessage(
        message,
        this.errorTypes.INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await client.db.updateConfig(guild.id, 'messageDeleteLogChannelId', messageDeleteLogChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Logging`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`message delete log\` was successfully updated. ${success}`)
      .addField('Message Delete Log', `${oldMessageDeleteLogChannel} ➔ ${messageDeleteLogChannel}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetMessageDeleteLog;
