const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

// Color hex regex
const rgx = /^#?[0-9A-F]{6}$/i;

/**
 * Calypso's CreateColor command
 * @extends Command
 */
class CreateColor extends Command {

  /**
   * Creates instance of CreateColor command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'createcolor',
      aliases: ['cc'],
      usage: 'createcolor <hex> <color name>',
      description: 'Creates a new role for the given color hex. Color roles are denoted by the prefix `#`.',
      type: client.types.COLOR,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      examples: ['createcolor #FF0000 Red']
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
    const { MISSING_ARG, INVALID_ARG, COMMAND_FAIL } = this.errorTypes;

    let hex = args.shift();

    // Check arguments
    if (!rgx.test(hex)) {
      return this.sendErrorMessage(message, INVALID_ARG, 'Please provide a valid color hex and color name');
    }
    if (args.length === 0) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a color name');

    let colorName = args.join(' ');
    if (!colorName.startsWith('#')) colorName = '#' + colorName;
    if (!hex.startsWith('#')) hex = '#' + hex;

    // Create color role
    try {

      const role = await guild.roles.create({
        data: {
          name: colorName,
          color: hex,
          permissions: []
        }
      });

      const embed = new MessageEmbed()
        .setTitle('Create Color')
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setDescription(`Successfully created the ${role} color.`)
        .addField('Hex', `\`${hex}\``, true)
        .addField('Color Name', `\`${colorName.slice(1, colorName.length)}\``, true)
        .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(hex);
      channel.send(embed);
    } catch (err) {
      client.logger.error(err.stack);
      this.sendErrorMessage(
        message, COMMAND_FAIL, 'Unable to create role, please try again in a few seconds', err.message
      );
    }
  }
}

module.exports = CreateColor;
