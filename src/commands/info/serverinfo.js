const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { owner, voice } = require('../../utils/emojis.json');
const { stripIndent } = require('common-tags');

const region = {
  'us-central': ':flag_us:  `US Central`',
  'us-east': ':flag_us:  `US East`',
  'us-south': ':flag_us:  `US South`',
  'us-west': ':flag_us:  `US West`',
  'europe': ':flag_eu:  `Europe`',
  'singapore': ':flag_sg:  `Singapore`',
  'japan': ':flag_jp:  `Japan`',
  'russia': ':flag_ru:  `Russia`',
  'hongkong': ':flag_hk:  `Hong Kong`',
  'brazil': ':flag_br:  `Brazil`',
  'sydney': ':flag_au:  `Sydney`',
  'southafrica': '`South Africa` :flag_za:'
};

const verificationLevels = {
  NONE: '`None`',
  LOW: '`Low`',
  MEDIUM: '`Medium`',
  HIGH: '`High`',
  VERY_HIGH: '`Highest`'
};

const notifications = {
  ALL: '`All`',
  MENTIONS: '`Mentions`'
};

/**
 * Calypso's ServerInfo command
 * @extends Command
 */
class ServerInfo extends Command {

  /**
   * Creates instance of ServerInfo command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'serverinfo',
      aliases: ['serverstats', 'server', 'si'],
      usage: 'serverinfo',
      description: 'Fetches information and statistics about the server.',
      type: client.types.INFO
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message) {

    const { guild, channel, member, author } = message;

    // Get roles count
    const roleCount = guild.roles.cache.size - 1; // Don't count @everyone

    // Get member stats
    const members = guild.members.cache.array();
    const memberCount = members.length;
    const online = members.filter((m) => m.presence.status === 'online').length;
    const offline = members.filter((m) => m.presence.status === 'offline').length;
    const dnd = members.filter((m) => m.presence.status === 'dnd').length;
    const afk = members.filter((m) => m.presence.status === 'idle').length;
    const bots = members.filter(b => b.user.bot).length;

    // Get channel stats
    const channels = guild.channels.cache.array();
    const channelCount = channels.length;
    const textChannels =
      channels.filter(c => c.type === 'text' && c.viewable).sort((a, b) => a.rawPosition - b.rawPosition);
    const voiceChannels = channels.filter(c => c.type === 'voice').length;
    const newsChannels = channels.filter(c => c.type === 'news').length;
    const categoryChannels = channels.filter(c => c.type === 'category').length;

    // Build server stats
    const serverStats = stripIndent`
      Members  :: [ ${memberCount} ]
               :: ${online} Online
               :: ${dnd} Busy
               :: ${afk} AFK
               :: ${offline} Offline
               :: ${bots} Bots
      Channels :: [ ${channelCount} ]
               :: ${textChannels.length} Text
               :: ${voiceChannels} Voice
               :: ${newsChannels} Announcement
               :: ${categoryChannels} Category
      Roles    :: [ ${roleCount} ]
    `;

    const embed = new MessageEmbed()
      .setTitle(`${guild.name}'s Information`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addField('ID', `\`${guild.id}\``, true)
      .addField('Region', region[guild.region], true)
      .addField(`Owner ${owner}`, guild.owner, true)
      .addField('Verification Level', verificationLevels[guild.verificationLevel], true)
      .addField('Rules Channel', (guild.rulesChannel) ? `${guild.rulesChannel}` : '`None`', true)
      .addField('System Channel', (guild.systemChannel) ? `${guild.systemChannel}` : '`None`', true)
      .addField('AFK Channel', (guild.afkChannel) ? `${voice} ${guild.afkChannel.name}` : '`None`', true)
      .addField('AFK Timeout',
        (guild.afkChannel) ? `\`${moment.duration(guild.afkTimeout * 1000).asMinutes()} minutes\`` : '`None`', true
      )
      .addField('Default Notifications', notifications[guild.defaultMessageNotifications], true)
      .addField('Partnered', `\`${guild.partnered}\``, true)
      .addField('Verified', `\`${guild.verified}\``, true)
      .addField('Created On', `\`${moment(guild.createdAt).format('MMM DD YYYY')}\``, true)
      .addField('Server Stats', `\`\`\`asciidoc\n${serverStats}\`\`\``)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    if (guild.description) embed.setDescription(guild.description);
    if (guild.bannerURL) embed.setImage(guild.bannerURL({ dynamic: true }));
    channel.send(embed);
  }
}

module.exports = ServerInfo;
