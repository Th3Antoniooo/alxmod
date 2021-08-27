const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's RemoveRole command
 * @extends Command
 */
class RemoveRole extends Command {

  /**
   * Creates instance of RemoveRole command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'removerole',
      aliases: ['remover', 'rr'],
      usage: 'removerole <user mention/ID> <role mention/ID> [reason]',
      description: 'Removes the specified role from the provided user.',
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      examples: ['removerole @Nettles @Member']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, author } = message;
    const { MISSING_ARG, INVALID_ARG, COMMAND_FAIL } = this.errorTypes;
    const none = '`None`';

    const member = this.getMemberFromMention(message, args[0]) || guild.members.cache.get(args[0]); // Get member

    // Invalid or missing member
    if (!member) {
      return this.sendErrorMessage(
        message, !args[0] ? MISSING_ARG : INVALID_ARG, 'Please mention a user or provide a valid user ID'
      );
    }

    // Member role higher than mod
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'You cannot add a role to someone with an equal or higher role'
      );
    }

    const role = this.getRoleFromMention(message, args[1]) || guild.roles.cache.get(args[1]); // Get role

    // Reason
    let reason = args.slice(2).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    // Invalid role
    if (!role) {
      return this.sendErrorMessage(
        message, !args[1] ? MISSING_ARG : INVALID_ARG, 'Please mention a role or provide a valid role ID'
      );
    } else if (!member.roles.cache.has(role.id)) {
      return this.sendErrorMessage(message, INVALID_ARG, 'User does not have the provided role');
    } else {
      try {

        // Add role
        await member.roles.remove(role);
        const embed = new MessageEmbed()
          .setTitle('Remove Role')
          .setDescription(`${role} was successfully removed from ${member}.`)
          .addField('Moderator', message.member, true)
          .addField('Member', member, true)
          .addField('Role', role, true)
          .addField('Reason', reason)
          .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(guild.me.displayHexColor);
        channel.send(embed);

        // Update mod log
        this.sendModLogMessage(message, reason, { Member: member, Role: role });

      } catch (err) {
        client.logger.error(err.stack);
        this.sendErrorMessage(message, COMMAND_FAIL, 'Please check the role hierarchy', err.message);
      }
    }
  }
}

module.exports = RemoveRole;
