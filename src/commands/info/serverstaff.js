const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's ServerStaff command
 * @extends Command
 */
class ServerStaff extends Command {

  /**
   * Creates instance of ServerStaff command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'serverstaff',
      aliases: ['staff'],
      usage: 'serverstaff',
      description: 'Displays a list of all current server moderators and admins.',
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

    const { client, guild, channel, member, author } = message;

    // Get mod role
    const modRoleId = client.configs.get(guild.id).modRoleId;
    let modRole, mods;
    if (modRoleId) modRole = guild.roles.cache.get(modRoleId);

    // Get admin role
    const adminRoleId = client.configs.get(guild.id).adminRoleId;
    let adminRole, admins;
    if (adminRoleId) adminRole = guild.roles.cache.get(adminRoleId);

    let modList = [], adminList = [];

    // Get mod list
    if (modRole) {
      modList = guild.members.cache.filter(m => {
        if (m.roles.cache.find(r => r === modRole)) return true;
      }).sort((a, b) => (a.joinedAt > b.joinedAt) ? 1 : -1).array();
    }

    if (modList.length > 0) mods = client.utils.trimStringFromArray(modList, 1024);
    else mods = 'No mods found.';

    // Get admin list
    if (adminRole) {
      adminList = guild.members.cache.filter(m => {
        if (m.roles.cache.find(r => r === adminRole)) return true;
      }).sort((a, b) => (a.joinedAt > b.joinedAt) ? 1 : -1).array();
    }

    if (adminList.length > 0) admins = client.utils.trimStringFromArray(adminList, 1024);
    else admins = 'No admins found.';

    const embed = new MessageEmbed()
      .setTitle(`Server Staff List [${modList.length + adminList.length}]`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addField(`Admins [${adminList.length}]`, admins, true)
      .addField(`Mods [${modList.length}]`, mods, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = ServerStaff;
