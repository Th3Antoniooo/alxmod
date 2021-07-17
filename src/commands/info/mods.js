const Command = require('../Command.js');
const ReactionMenu = require('../ReactionMenu.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Mods command
 * @extends Command
 */
class Mods extends Command {

  /**
   * Creates instance of Mods command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'mods',
      usage: 'mods',
      description: 'Displays a list of all current mods.',
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

    // Get mod role
    const modRoleId = client.configs.get(guild.id).modRoleId;
    const modRole = guild.roles.cache.get(modRoleId) || '`None`';

    const mods = guild.members.cache.filter(m => {
      if (m.roles.cache.find(r => r === modRole)) return true;
    }).sort((a, b) => (a.joinedAt > b.joinedAt) ? 1 : -1).array();

    const embed = new MessageEmbed()
      .setTitle(`Mod List [${mods.length}]`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addField('Mod Role', modRole)
      .addField('Mod Count', `**${mods.length}** out of **${guild.members.cache.size}** members`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    const interval = 25;
    if (mods.length === 0) channel.send(embed.setDescription('No mods found.'));
    else if (mods.length <= interval) {
      const range = (mods.length == 1) ? '[1]' : `[1 - ${mods.length}]`;
      channel.send(embed
        .setTitle(`Mod List ${range}`)
        .setDescription(mods.join('\n'))
      );

    // Reaction Menu
    } else {

      embed
        .setTitle('Mod List')
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter('Expires after two minutes.\n' + member.displayName, author.displayAvatarURL({ dynamic: true }));

      new ReactionMenu(client, { channel, member, embed, arr: mods, interval });
    }
  }
}

module.exports = Mods;
