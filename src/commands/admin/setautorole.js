const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetAutoRole command
 * @extends Command
 */
class SetAutoRole extends Command {

  /**
   * Creates instance of SetAutoRole command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setautorole',
      aliases: ['setaur', 'saur'],
      usage: 'setautorole <role mention/ID>',
      description: oneLine`
        Sets the role all new members will receive upon joining your server.
        Provide no role to clear the current \`auto role\`.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setautorole @Member']
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

    const autoRoleId = client.configs.get(guild.id).autoRoleId;
    const oldAutoRole = guild.roles.cache.find(r => r.id === autoRoleId) || none;

    let autoRole;
    if (args.length === 0) autoRole = none; // Clear if no args provided
    else autoRole = this.getRoleFromMention(message, args[0]) || message.guild.roles.cache.get(args[0]);

    // Update config
    await client.db.updateConfig(guild.id, 'autoRoleId', autoRole.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`auto role\` was successfully updated. ${success}`)
      .addField('Auto Role', `${oldAutoRole} ➔ ${autoRole}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetAutoRole;
