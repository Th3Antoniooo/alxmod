const Command = require('../Command.js');
const ReactionMenu = require('../ReactionMenu.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Emojis command
 * @extends Command
 */
class Emojis extends Command {

  /**
   * Creates instance of Emojis command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'emojis',
      aliases: ['e'],
      usage: 'emojis',
      description: 'Displays a list of all current emojis.',
      type: client.types.INFO
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message) {

    const { client, guild, channel, member, author } = message;

    //Get emojis
    const emojis = [];
    guild.emojis.cache.forEach(e => emojis.push(`${e} **-** \`:${e.name}:\``));

    const embed = new MessageEmbed()
      .setTitle(`Emoji List [${guild.emojis.cache.size}]`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    const interval = 25;
    if (emojis.length === 0) channel.send(embed.setDescription('No emojis found. 😢'));
    else if (emojis.length <= interval) {
      const range = (emojis.length == 1) ? '[1]' : `[1 - ${emojis.length}]`;
      channel.send(embed
        .setTitle(`Emoji List ${range}`)
        .setDescription(emojis.join('\n'))
        .setThumbnail(guild.iconURL({ dynamic: true }))
      );

    // Reaction Menu
    } else {

      embed
        .setTitle('Emoji List')
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setFooter(
          'Expires after two minutes.\n' + member.displayName,
          author.displayAvatarURL({ dynamic: true })
        );

      new ReactionMenu(client, channel, member, embed, emojis, interval);
    }
  }
}

module.exports = Emojis;
