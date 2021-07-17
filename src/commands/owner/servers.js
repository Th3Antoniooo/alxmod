const Command = require('../Command.js');
const ReactionMenu = require('../ReactionMenu.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Servers command
 * @extends Command
 */
class Servers extends Command {

  /**
   * Creates instance of Servers command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'servers',
      aliases: ['servs'],
      usage: 'servers',
      description: 'Displays a list of Calypso\'s joined servers.',
      type: client.types.OWNER,
      ownerOnly: true
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

    // Create servers list
    const servers = client.guilds.cache.array().map(guild => {
      return `\`${guild.id}\` - **${guild.name}** - \`${guild.members.cache.size}\` members`;
    });

    const embed = new MessageEmbed()
      .setTitle('Server List')
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    // Create ReactionMenu if list is greater than 10
    if (servers.length <= 10) {
      const range = (servers.length == 1) ? '[1]' : `[1 - ${servers.length}]`;
      channel.send(embed.setTitle(`Server List ${range}`).setDescription(servers.join('\n')));
    } else {
      new ReactionMenu(client, { channel, member, embed, arr: servers });
    }
  }
}

module.exports = Servers;
