const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetModChannels command
 * @extends Command
 */
class SetModChannels extends Command {

  /**
   * Creates instance of SetModChannels command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setmodchannels',
      aliases: ['setmc', 'smc'],
      usage: 'setmodchannels <channel mentions/IDs>',
      description: oneLine`
        Sets the moderator only text channels for your server.
        Only \`${client.utils.capitalize(client.types.MOD)}\` type commands will work in these channels,
        and Calypso will only respond to members with permission to use those commands.
        Provide no channels to clear the current \`mod channels\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmodchannels #general #memes #off-topic']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { client, guild, channel, member, author } = message;
    const none = '`None`';
    const { trimArray } = client.utils;

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`mod channels\` were successfully updated. ${success}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    // Get channels
    let channels = [];
    for (const arg of args) {
      const channel = this.getChannelFromMention(message, arg) || guild.channels.cache.get(arg);
      if (client.isAllowed(channel)) channels.push(channel);
      else {
        return this.sendErrorMessage(
          message,
          this.errorTypes.INVALID_ARG,
          'Please mention only accessible text channels or provide only valid text channel IDs'
        );
      }
    }
    channels = [...new Set(channels)];

    // Get old channels
    let oldChannels = client.configs.get(guild.id).modOnlyChannels;
    if (oldChannels.length === 0) oldChannels = none;
    else oldChannels = trimArray(oldChannels).join(' ');

    // Update mod only channels
    client.actions.UpdateModOnlyChannels.run({ guildId: guild.id, channels });

    // Send result
    const newChannels = channels.length == 0 ? none : trimArray(channels).join(' ');
    channel.send(embed.addField('Mod Channels', `${oldChannels} ➔ ${newChannels}`));
  }
}

module.exports = SetModChannels;
