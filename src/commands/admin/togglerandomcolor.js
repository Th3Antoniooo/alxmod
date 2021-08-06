const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success, fail } = require('../../utils/emojis.json');

/**
 * Calypso's ToggleRandomColor command
 * @extends Command
 */
class ToggleRandomColor extends Command {

  /**
   * Creates instance of ToggleRandomColor command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'togglerandomcolor',
      aliases: ['togglerc', 'togrc', 'trc'],
      usage: 'togglerandomcolor',
      description: 'Enables or disables random color role assigning when someone joins your server.',
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message) {

    const { client, guild, channel, member, author } = message;
    const enabled = '`enabled`';
    const disabled = '`disabled`';

    let randomColor = client.configs.get(guild.id).randomColor;
    randomColor = 1 - randomColor; // Invert

    // Update db and config
    await client.db.updateConfig(guild.id, 'randomColor', randomColor);

    let description, status;
    if (randomColor == 1) {
      status = `${disabled} ➔ ${enabled}`;
      description = `\`Random color\` has been successfully **enabled**. ${success}`;
    } else {
      status = `${enabled} ➔ ${disabled}`;
      description = `\`Random color\` has been successfully **disabled**. ${fail}`;
    }

    const embed = new MessageEmbed()
      .setTitle('Settings: `System`')
      .setThumbnail(guild.iconURL())
      .setDescription(description)
      .addField('Random Color', status, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = ToggleRandomColor;
