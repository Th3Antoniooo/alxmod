const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const colors = require('../../utils/colors.json');
const len = Object.keys(colors).length;
const { oneLine } = require('common-tags');

/**
 * Calypso's CreateDefaultColors command
 * @extends Command
 */
class CreateDefaultColors extends Command {

  /**
   * Creates instance of CreateDefaultColors command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'createdefaultcolors',
      aliases: ['cdc'],
      usage: 'createdefaultcolors',
      description: oneLine`
        Generates the ${len} default color roles that come with packaged with Calypso on your server. 
        Color roles are denoted by the prefix \`#\`.
      `,
      type: client.types.COLOR,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES']
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
    const none = '`None`';

    const embed = new MessageEmbed()
      .setTitle('Create Default Colors')
      .setDescription('Creating colors...')
      .setColor(guild.me.displayHexColor);
    const msg = await channel.send(embed);

    // Create default colors
    let position = 1;
    const colorList = [];
    for (let [key, value] of Object.entries(colors)) {
      key = '#' + key;
      if (!guild.roles.cache.find(r => r.name === key)) {
        try {
          const role = await guild.roles.create({
            data: {
              name: key,
              color: value,
              position: position,
              permissions: []
            }
          });
          colorList.push(role);
          position++; // Increment position to create roles in order
        } catch (err) {
          client.logger.error(err.message);
        }
      }
    }

    const fails = len - colorList.length;
    embed // Build embed
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(`Created \`${len - fails}\` of  \`${len}\` default colors.`)
      .addField('Colors Created', (colorList.length > 0) ? colorList.reverse().join(' ') : none)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    msg.edit(embed);
  }
}

module.exports = CreateDefaultColors;
