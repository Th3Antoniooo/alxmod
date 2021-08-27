const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { stripIndent, oneLine } = require('common-tags');

module.exports = class Settings extends Command {
  constructor(client) {
    super(client, {
      name: 'settings',
      aliases: ['set', 's', 'config', 'conf'],
      usage: 'settings [category]',
      description: oneLine`
        Displays a list of all current settings for the given setting category. 
        If no category is given, the amount of settings for every category will be displayed.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['settings System']
    });
  }
  run(message, args) {

    const { client, guild, channel, member, author } = message;
    const { trimArray, replaceKeywords, replacecrownKeywords } = client.utils;
    const none = '`None`';

    // Set values
    const config = client.configs.get(guild.id);
    const prefix = `\`${config.prefix}\``;
    const systemChannel = guild.channels.cache.get(config.systemChannelId) || none;
    const starboardChannel = guild.channels.cache.get(config.starboardChannelId) || none;
    const modLogChannel = guild.channels.cache.get(config.modLogChannelId) || none;
    const memberLog = guild.channels.cache.get(config.memberLogChannelId) || none;
    const nicknameLog = guild.channels.cache.get(config.nicknameLogChannelId) || none;
    const roleLog = guild.channels.cache.get(config.roleLogChannelId) || none;
    const messageEditLog = guild.channels.cache.get(config.messageEditLogChannelId) || none;
    const messageDeleteLog = guild.channels.cache.get(config.messageDeleteLogChannelId) || none;
    const verificationChannel = guild.channels.cache.get(config.verificationChannelId) || none;
    const welcomeChannel = guild.channels.cache.get(config.welcomeChannelId) || none;
    const farewellChannel = guild.channels.cache.get(config.farewellChannelId) || none;
    const crownChannel = guild.channels.cache.get(config.crownChannelId) || none;
    let modOnlyChannels = config.modOnlyChannels;
    if (modOnlyChannels.length === 0) modOnlyChannels = none;
    else modOnlyChannels = trimArray(modOnlyChannels).join(' ');
    const adminRole = guild.roles.cache.get(config.adminRoleId) || none;
    const modRole = guild.roles.cache.get(config.modRoleId) || none;
    const muteRole = guild.roles.cache.get(config.muteRoleId) || none;
    const autoRole = guild.roles.cache.get(config.autoRoleId) || none;
    const verificationRole = guild.roles.cache.get(config.verificationRoleId) || none;
    const crownRole = guild.roles.cache.get(config.crownRoleId) || none;
    const autoKick = (config.auto_kick) ? `After \`${config.autoKick}\` warn(s)` : '`disabled`';
    const messagePoints = `\`${config.messagePoints}\``;
    const commandPoints = `\`${config.commandPoints}\``;
    const voicePoints = `\`${config.voicePoints}\``;
    let verificationMessage = (config.verificationMessage) ? replaceKeywords(config.verificationMessage) : none;
    let welcomeMessage = (config.welcomeMessage) ? replaceKeywords(config.welcomeMessage) : none;
    let farewellMessage = (config.farewellMessage) ? replaceKeywords(config.farewellMessage) : none;
    let crownMessage = (config.crownMessage) ? replacecrownKeywords(config.crownMessage) : none;
    const crownSchedule = (config.crownSchedule) ? `\`${config.crownSchedule}\`` : none;
    let disabledCommands = none;
    if (config.disabledCommands) disabledCommands = config.disabledCommands.map(c => `\`${c.name}\``).join(' ');

    // Get statuses
    const verificationStatus = `\`${client.utils.getStatus(
      config.verificationRoleId && config.verificationChannelId && config.verificationMessage
    )}\``;
    const randomColor = `\`${client.utils.getStatus(config.random_color)}\``;
    const welcomeStatus = `\`${client.utils.getStatus(config.welcomeMessage && config.welcomeChannelId)}\``;
    const farewellStatus = `\`${client.utils.getStatus(config.farewellMessage && config.farewellChannelId)}\``;
    const pointsStatus = `\`${client.utils.getStatus(config.pointTracking)}\``;
    const crownStatus = `\`${client.utils.getStatus(config.crown_role_id && config.crownSchedule)}\``;

    // Trim messages to 1024 characters
    if (verificationMessage.length > 1024) verificationMessage = verificationMessage.slice(0, 1021) + '...';
    if (welcomeMessage.length > 1024) welcomeMessage = welcomeMessage.slice(0, 1021) + '...';
    if (farewellMessage.length > 1024) farewellMessage = farewellMessage.slice(0, 1021) + '...';
    if (crownMessage.length > 1024) crownMessage = crownMessage.slice(0, 1021) + '...';

    /** ------------------------------------------------------------------------------------------------
     * CATEGORY CHECKS
     * ------------------------------------------------------------------------------------------------ */
    let setting = args.join('').toLowerCase();
    if (setting.endsWith('setting')) setting = setting.slice(0, -7);
    const embed = new MessageEmbed()
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    switch (setting) {
      case 's':
      case 'sys':
      case 'system':
        return channel.send(embed
          .setTitle('Settings: `System`')
          .addField('Prefix', prefix, true)
          .addField('System Channel', systemChannel, true)
          .addField('Starboard Channel', starboardChannel, true)
          .addField('Admin Role', adminRole, true)
          .addField('Mod Role', modRole, true)
          .addField('Mute Role', muteRole, true)
          .addField('Auto Role', autoRole, true)
          .addField('Auto Kick', autoKick, true)
          .addField('Random Color', randomColor, true)
          .addField('Mod Channels', modOnlyChannels)
          .addField('Disabled Commands', disabledCommands)
        );
      case 'l':
      case 'log':
      case 'logs':
      case 'logging':
        return channel.send(embed
          .setTitle('Settings: `Logging`')
          .addField('Mod Log', modLogChannel, true)
          .addField('Member Log', memberLog, true)
          .addField('Nickname Log', nicknameLog, true)
          .addField('Role Log', roleLog, true)
          .addField('Message Edit Log', messageEditLog, true)
          .addField('Message Delete Log', messageDeleteLog, true)
        );
      case 'v':
      case 'ver':
      case 'verif':
      case 'verification':
        embed
          .setTitle('Settings: `Verification`')
          .addField('Role', verificationRole, true)
          .addField('Channel', verificationChannel, true)
          .addField('Status', verificationStatus, true)
          .addField('Message', verificationMessage);
        return channel.send(embed);
      case 'w':
      case 'welcome':
      case 'welcomes':
        embed
          .setTitle('Settings: `Welcomes`')
          .addField('Channel', welcomeChannel, true)
          .addField('Status', welcomeStatus, true)
          .addField('Message', welcomeMessage);
        return channel.send(embed);
      case 'f':
      case 'farewell':
      case 'farewells':
        embed
          .setTitle('Settings: `Farewells`')
          .addField('Channel', farewellChannel, true)
          .addField('Status', farewellStatus, true)
          .addField('Message', farewellMessage);
        return channel.send(embed);
      case 'p':
      case 'point':
      case 'points':
        return channel.send(embed
          .setTitle('Settings: `Points`')
          .addField('Message Points', messagePoints, true)
          .addField('Command Points', commandPoints, true)
          .addField('Voice Points', voicePoints, true)
          .addField('Status', pointsStatus)
        );
      case 'c':
      case 'crown':
        embed
          .setTitle('Settings: `crown`')
          .addField('Role', crownRole, true)
          .addField('Channel', crownChannel, true)
          .addField('Schedule', crownSchedule, true)
          .addField('Status', crownStatus)
          .addField('Message', crownMessage);
        return channel.send(embed);
    }
    if (setting)
      return this.sendErrorMessage(message, 0, stripIndent`
        Please enter a valid settings category, use ${config.prefix}settings for a list
      `);

    /** ------------------------------------------------------------------------------------------------
     * FULL SETTINGS
     * ------------------------------------------------------------------------------------------------ */

    embed
      .setTitle('Settings')
      .setDescription(`**More Information:** \`${config.prefix}settings [category]\``)
      .addField('System', '`11` settings', true)
      .addField('Logging', '`6` settings', true)
      .addField('Verification', '`3` settings', true)
      .addField('Welcomes', '`2` settings', true)
      .addField('Farewells', '`2` settings', true)
      .addField('Points', '`3` settings', true)
      .addField('crown', '`4` settings', true);

    channel.send(embed);
  }
};