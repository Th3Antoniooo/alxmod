const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');

/**
 * Calypso's SetAdminRole command
 * @extends Command
 */
class SetAdminRole extends Command {

  /**
   * Creates instance of SetAdminRole command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setadminrole',
      aliases: ['setar', 'sar'],
      usage: 'setadminrole <role mention/ID>',
      description: 'Sets the `admin role` for your server. Provide no role to clear the current `admin role`.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setadminrole @Admin']
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
    const none = '`None`';

    const adminRoleId = client.configs.get(guild.id).adminRoleId;
    const oldAdminRole = guild.roles.cache.find(r => r.id === adminRoleId) || none;

    let adminRole;
    if (args.length === 0) adminRole = none; // Clear if no args provided
    else adminRole = this.getRoleFromMention(message, args[0]) || message.guild.roles.cache.get(args[0]);

    // Update config
    await client.db.updateConfig(guild.id, 'adminRoleId', adminRole.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`admin role\` was successfully updated. ${success}`)
      .addField('Admin Role', `${oldAdminRole} ➔ ${adminRole}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetAdminRole;
