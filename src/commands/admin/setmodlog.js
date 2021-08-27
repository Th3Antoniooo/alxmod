const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetModLog command
 * @extends Command
 */
class SetModLog extends Command {

  /**
   * Creates instance of SetModLog command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setmodlog',
      aliases: ['setml', 'sml'],
      usage: 'setmodlog <channel mention/ID>',
      description: oneLine`
        Sets the mod log text channel for your server. 
        Provide no channel to clear the current \`mod log\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmodlog #mod-log']
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

    const modLogChannelId = client.configs.get(guild.id).modLogChannelId;
    const oldModLogChannel = guild.channels.cache.get(modLogChannelId) || none;

    let modLogChannel;
    if (args.length === 0) modLogChannel = none; // Clear if no args provided
    else modLogChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (!client.isAllowed(modLogChannel) && modLogChannel != none) {
      return this.sendErrorMessage(
        message,
        this.errorTypes.INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await client.db.updateConfig(guild.id, 'modLogChannelId', modLogChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Logging`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`mod log\` was successfully updated. ${success}`)
      .addField('Mod Log', `${oldModLogChannel} ➔ ${modLogChannel}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetModLog;
