const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's Color command
 * @extends Command
 */
class Color extends Command {

  /**
   * Creates instance of Color command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'color',
      aliases: ['changecolor', 'colour', 'c'],
      usage: 'color <role mention/ID | color name>',
      description: oneLine`
        Changes your current color to the one specified. Provide no color to clear your current color role.
      `,
      type: client.types.COLOR,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
      examples: ['color Red']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, member, author } = message;
    const { INVALID_ARG, COMMAND_FAIL } = this.errorTypes;
    const none = '`None`';

    const prefix = client.configs.get(guild.id).prefix; // Get prefix

    // Create embed
    const embed = new MessageEmbed()
      .setTitle('Color Change')
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .addField('Member', member, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();

    // Get colors and old color
    const colors = guild.roles.cache.filter(c => c.name.startsWith('#'));
    const colorName = args.join('').toLowerCase();
    const oldColor = (member.roles.color && member.roles.color.name.startsWith('#')) ? member.roles.color : none;

    // Clear if no color provided
    if (!colorName) {
      try {
        await member.roles.remove(colors);
        return channel.send(embed.addField('Color', `${oldColor} ➔ ${none}`, true));
      } catch (err) {
        client.logger.error(err.stack);
        return this.sendErrorMessage(
          message, COMMAND_FAIL, 'Unable to remove color role, please check the role hierarchy', err.message
        );
      }
    }

    // Get color role
    const role = this.getRoleFromMention(message, args[0]) || guild.roles.cache.get(args[0]);
    let color;
    if (role && colors.get(role.id)) color = role;
    if (!color) {
      color = colors.find(c => {
        return colorName == c.name.slice(1).toLowerCase().replace(/\s/g, '') ||
          colorName == c.name.toLowerCase().replace(/\s/g, '');
      });
    }

    // Color does not exist
    if (!color) {
      return this.sendErrorMessage(
        message, INVALID_ARG, `Please provide a valid color, use ${prefix}colors for a list`
      );
    } else { // Color exists
      try {
        // Update role
        await member.roles.remove(colors);
        await member.roles.add(color);
        channel.send(embed.addField('Color', `${oldColor} ➔ ${color}`, true).setColor(color.hexColor));
      } catch (err) {
        client.logger.error(err.stack);
        this.sendErrorMessage(
          message, COMMAND_FAIL, 'Unable to update role, please check the role hierarchy', err.message
        );
      }
    }
  }
}

module.exports = Color;
