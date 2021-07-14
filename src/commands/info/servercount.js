const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { stripIndent } = require('common-tags');

/**
 * Calypso's ServerCount command
 * @extends Command
 */
class ServerCount extends Command {

  /**
   * Creates instance of ServerCount command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'servercount',
      aliases: ['usercount', 'sc', 'uc'],
      usage: 'servercount',
      description: 'Fetches Calypso\'s current server and user count.',
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

    // Get server and user counts
    const counts = stripIndent`
      Servers :: ${client.guilds.cache.size}
      Users   :: ${client.users.cache.size}
    `;

    const embed = new MessageEmbed()
      .setTitle('Calypso\'s Server Count')
      .setDescription(stripIndent`\`\`\`asciidoc\n${counts}\`\`\``)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = ServerCount;
