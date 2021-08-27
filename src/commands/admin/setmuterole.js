const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');

/**
 * Calypso's SetMuteRole command
 * @extends Command
 */
class SetMuteRole extends Command {

  /**
   * Creates instance of SetMuteRole command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setmuterole',
      aliases: ['setmur', 'smur'],
      usage: 'setmuterole <role mention/ID>',
      description: 'Sets the `mute role` your server. Provide no role to clear the current `mute role`.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setmuterole @Muted']
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

    const muteRoleId = client.configs.get(guild.id).muteRoleId;
    const oldMuteRole = guild.roles.cache.find(r => r.id === muteRoleId) || none;

    let muteRole;
    if (args.length === 0) muteRole = none; // Clear if no args provided
    else muteRole = this.getRoleFromMention(message, args[0]) || message.guild.roles.cache.get(args[0]);

    // Update config
    await client.db.updateConfig(guild.id, 'muteRoleId', muteRole.id || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`mute role\` was successfully updated. ${success}`)
      .addField('Mute Role', `${oldMuteRole} ➔ ${muteRole}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetMuteRole;
