const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');

/**
 * Calypso's SetPrefix command
 * @extends Command
 */
class SetPrefix extends Command {

  /**
   * Creates instance of SetPrefix command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setprefix',
      aliases: ['setp', 'sp'],
      usage: 'setprefix <prefix>',
      description: 'Sets the command `prefix` for your server. The max `prefix` length is 3 characters.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setprefix !']
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
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;

    const oldPrefix = client.configs.get(guild.id).prefix; // Old prefix
    const prefix = args[0]; // New prefix

    // Missing or invalid prefix
    if (!prefix) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a prefix');
    else if (prefix.length > 3) {
      return this.sendErrorMessage(message, INVALID_ARG, 'Please ensure the prefix is no larger than 3 characters');
    }

    // Update prefix
    await client.db.updateConfig(guild.id, 'prefix', prefix);

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`The \`prefix\` was successfully updated. ${success}`)
      .addField('Prefix', `\`${oldPrefix}\` ➔ \`${prefix}\``)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetPrefix;
