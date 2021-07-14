const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const permissions = require('../../utils/permissions.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's Permissions command
 * @extends Command
 */
class Permissions extends Command {

  /**
   * Creates instance of Permissions command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'permissions',
      aliases: ['perms'],
      usage: 'permissions [user mention/ID]',
      description: oneLine`
        Displays all current permissions for the specified user. 
        If no user is given, your own permissions will be displayed.
      `,
      type: client.types.INFO,
      examples: ['permissions @Nettles']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { guild, channel, author } = message;

    // Get member
    const member = this.getMemberFromMention(message, args[0]) ||
      guild.members.cache.get(args[0]) ||
      message.member;

    // Get member permissions
    const memberPermissions = member.permissions.toArray();
    const finalPermissions = [];
    for (const permission in permissions) {
      if (memberPermissions.includes(permission)) finalPermissions.push(`+ ${permissions[permission]}`);
      else finalPermissions.push(`- ${permissions[permission]}`);
    }

    const embed = new MessageEmbed()
      .setTitle(`${member.displayName}'s Permissions`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setDescription(`\`\`\`diff\n${finalPermissions.join('\n')}\`\`\``)
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(member.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Permissions;
