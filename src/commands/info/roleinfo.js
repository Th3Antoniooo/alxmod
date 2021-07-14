const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const permissions = require('../../utils/permissions.json');

/**
 * Calypso's RoleInfo command
 * @extends Command
 */
class RoleInfo extends Command {

  /**
   * Creates instance of RoleInfo command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'roleinfo',
      aliases: ['role', 'ri'],
      usage: 'roleinfo <role mention/ID>',
      description: 'Fetches information about the provided role.',
      type: client.types.INFO,
      examples: ['roleinfo @Member']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { guild, channel, member, author } = message;

    // Get role
    const role = this.getRoleFromMention(message, args[0]) || guild.roles.cache.get(args[0]);

    // If role doesn't exist
    const { INVALID_ARG, MISSING_ARG } = this.errorTypes;
    if (!role) {
      return this.sendErrorMessage(
        message, args[0] ? INVALID_ARG : MISSING_ARG, 'Please mention a role or provide a valid role ID'
      );
    }

    // Get role permissions
    const rolePermissions = role.permissions.toArray();
    const finalPermissions = [];
    for (const permission in permissions) {
      if (rolePermissions.includes(permission)) finalPermissions.push(`+ ${permissions[permission]}`);
      else finalPermissions.push(`- ${permissions[permission]}`);
    }

    // Reverse role position
    const position = `\`${guild.roles.cache.size - role.position}\`/\`${guild.roles.cache.size}\``;

    const embed = new MessageEmbed()
      .setTitle('Role Information')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .addField('Role', role, true)
      .addField('Role ID', `\`${role.id}\``, true)
      .addField('Position', position, true)
      .addField('Mentionable', `\`${role.mentionable}\``, true)
      .addField('Bot Role', `\`${role.managed}\``, true)
      .addField('Color', `\`${role.hexColor.toUpperCase()}\``, true)
      .addField('Members', `\`${role.members.size}\``, true)
      .addField('Hoisted', `\`${role.hoist}\``, true)
      .addField('Created On', `\`${moment(role.createdAt).format('MMM DD YYYY')}\``, true)
      .addField('Permissions', `\`\`\`diff\n${finalPermissions.join('\n')}\`\`\``)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(role.hexColor);
    channel.send(embed);
  }
}

module.exports = RoleInfo;
