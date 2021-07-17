const Command = require('../Command.js');
const ReactionMenu = require('../ReactionMenu.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Admins command
 * @extends Command
 */
class Admins extends Command {

  /**
   * Creates instance of Admins command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'admins',
      usage: 'admins',
      description: 'Displays a list of all current admins.',
      type: client.types.INFO,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS']
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

    // Get admin role
    const adminRoleId = client.configs.get(guild.id).adminRoleId;
    const adminRole = guild.roles.cache.get(adminRoleId) || '`None`';

    const admins = guild.members.cache.filter(m => {
      if (m.roles.cache.find(r => r === adminRole)) return true;
    }).sort((a, b) => (a.joinedAt > b.joinedAt) ? 1 : -1).array();

    const embed = new MessageEmbed()
      .setTitle(`Admin List [${admins.length}]`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addField('Admin Role', adminRole)
      .addField('Admin Count', `**${admins.length}** out of **${guild.members.cache.size}** members`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    const interval = 25;
    if (admins.length === 0) channel.send(embed.setDescription('No admins found.'));
    else if (admins.length <= interval) {
      const range = (admins.length == 1) ? '[1]' : `[1 - ${admins.length}]`;
      channel.send(embed
        .setTitle(`Admin List ${range}`)
        .setDescription(admins.join('\n'))
      );

    // Reaction Menu
    } else {

      embed
        .setTitle('Admin List')
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter('Expires after two minutes.\n' + member.displayName, author.displayAvatarURL({ dynamic: true }));

      new ReactionMenu(client, { channel, member, embed, arr: admins, interval });
    }
  }
}

module.exports = Admins;
