const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's RandomColor command
 * @extends Command
 */
class RandomColor extends Command {

  /**
   * Creates instance of RandomColor command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'randomcolor',
      aliases: ['rc'],
      usage: 'randomcolor',
      description: 'Changes your current color to a random different one.',
      type: client.types.COLOR,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message) {

    const { client, guild, channel, member, author } = message;
    const { COMMAND_FAIL } = this.errorTypes;
    const none = '`None`';

    const embed = new MessageEmbed()
      .setTitle('Color Change')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addField('Member', member, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    // Get colors
    const colors = guild.roles.cache.filter(c => c.name.startsWith('#')).array();
    if (colors.length === 0) {
      return this.sendErrorMessage(message, COMMAND_FAIL, 'There are currently no colors set on this server');
    }

    // Get random color
    const color = colors[Math.floor(Math.random() * colors.length)];

    // Get old color
    const oldColor = (member.roles.color && member.roles.color.name.startsWith('#')) ?
      member.roles.color : none;

    // Assign random color
    try {
      await member.roles.remove(colors);
      await member.roles.add(color);
      channel.send(embed.addField('Color', `${oldColor} ➔ ${color}`, true).setColor(color.hexColor));
    } catch (err) {
      client.logger.error(err.stack);
      this.sendErrorMessage(message, 1, 'Please check the role hierarchy', err.message);
    }
  }
}

module.exports = RandomColor;
