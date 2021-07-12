const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

module.exports = class SetSystemChannel extends Command {
  constructor(client) {
    super(client, {
      name: 'setsystemchannel',
      aliases: ['setsc', 'ssc'],
      usage: 'setsystemchannel <channel mention/ID>',
      description: oneLine`
        Sets the system text channel for your server, which is where all system messages will be sent.
        Provide no channel to clear the current \`system channel\`. Clearing this setting is **not recommended**
        as a \`system channel\` is required to notify you about important errors.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setsystemchannel #general']
    });
  }
  async run(message, args) {

    const { client } = this;
    const { guild } = message;
    const none = '`None`';

    const systemChannelId = client.configs.get(guild.id).systemChannelId;
    const oldSystemChannel = guild.channels.cache.get(systemChannelId) || none;

    let systemChannel;
    if (args.length === 0) systemChannel = none; // Clear if no args provided
    else systemChannel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);

    if (
      (!client.isAllowed(systemChannel) || (systemChannel.type != 'text' && systemChannel.type != 'news')) &&
      systemChannel != none
    ) {
      return this.sendErrorMessage(
        message,
        this.errorTypes.INVALID_ARG,
        'Please mention an accessible text or announcement channel or provide a valid text or announcement channel ID'
      );
    }

    // Update config
    await this.client.db.updateConfig(guild.id, 'systemChannelId', systemChannel.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`system channel\` was successfully updated. ${success}`)
      .addField('System Channel', `${oldSystemChannel} ➔ ${systemChannel}`)
      .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    message.channel.send(embed);
  }
};
