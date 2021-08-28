const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');

/**
 * Calypso's SetModRole command
 * @extends Command
 */
class SetModRole extends Command {

  /**
   * Creates instance of SetModRole command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setmodrole',
      aliases: ['setmr', 'smr'],
      usage: 'setmodrole <role mention/ID>',
      description: 'Sets the `mod role` for your server. Provide no role to clear the current `mod role`.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmodrole @Mod']
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

    const modRoleId = client.configs.get(guild.id).modRoleId;
    const oldModRole = guild.roles.cache.find(r => r.id === modRoleId) || none;

    let modRole;
    if (args.length === 0) modRole = none; // Clear if no args provided
    else modRole = this.getRoleFromMention(message, args[0]) || message.guild.roles.cache.get(args[0]);

    // Update config
    await client.db.updateConfig(guild.id, 'modRoleId', modRole.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`mod role\` was successfully updated. ${success}`)
      .addField('Mod Role', `${oldModRole} ➔ ${modRole}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetModRole;
