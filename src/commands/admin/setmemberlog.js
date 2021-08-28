const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetMemberLog command
 * @extends Command
 */
class SetMemberLog extends Command {

  /**
   * Creates instance of SetMemberLog command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setmemberlog',
      aliases: ['setmeml', 'smeml'],
      usage: 'setmemberlog <channel mention/ID>',
      description: oneLine`
        Sets the member join/leave log text channel for your server. 
        Provide no channel to clear the current \`member log\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmemberlog #member-log']
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

    const memberLogChannelId = client.configs.get(guild.id).memberLogChannelId;
    const oldMemberLogChannel = guild.channels.cache.get(memberLogChannelId) || none;

    let memberLogChannel;
    if (args.length === 0) memberLogChannel = none; // Clear if no args provided
    else memberLogChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(memberLogChannel) && memberLogChannel != none) {
      return this.sendErrorMessage(
        message,
        this.errorTypes.INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await client.db.updateConfig(guild.id, 'memberLogChannelId', memberLogChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Logging`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`member log\` was successfully updated. ${success}`)
      .addField('Member Log', `${oldMemberLogChannel} ➔ ${memberLogChannel}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetMemberLog;
