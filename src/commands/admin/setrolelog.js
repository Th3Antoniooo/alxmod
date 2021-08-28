const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetRoleLog command
 * @extends Command
 */
class SetRoleLog extends Command {

  /**
   * Creates instance of SetRoleLog command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setrolelog',
      aliases: ['setrl', 'srl'],
      usage: 'setrolelog <channel mention/ID>',
      description: oneLine`
        Sets the role change log text channel for your server. 
        Provide no channel to clear the current \`role log\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setrolelog #bot-log']
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

    const roleLogChannelId = client.configs.get(guild.id).roleLogChannelId;
    const oldRoleLogChannel = guild.channels.cache.get(roleLogChannelId) || none;

    let roleLogChannel;
    if (args.length === 0) roleLogChannel = none; // Clear if no args provided
    else roleLogChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(roleLogChannel) && roleLogChannel != none) {
      return this.sendErrorMessage(
        message,
        this.errorTypes.INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await client.db.updateConfig(guild.id, 'roleLogChannelId', roleLogChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Logging`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`role log\` was successfully updated. ${success}`)
      .addField('Role Log', `${oldRoleLogChannel} ➔ ${roleLogChannel}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetRoleLog;
