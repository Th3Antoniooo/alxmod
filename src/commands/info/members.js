const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const emojis = require('../../utils/emojis.json');
const { stripIndent } = require('common-tags');

/**
 * Calypso's Members command
 * @extends Command
 */
class Members extends Command {

  /**
   * Creates instance of Members command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'members',
      aliases: ['memberstatus'],
      usage: 'members',
      description: 'Displays how many server members are online, busy, AFK, and offline.',
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

    const { guild, channel, member, author } = message;

    // Count members by status
    const members = guild.members.cache.array();
    const online = members.filter((m) => m.presence.status === 'online').length;
    const offline = members.filter((m) => m.presence.status === 'offline').length;
    const dnd = members.filter((m) => m.presence.status === 'dnd').length;
    const afk = members.filter((m) => m.presence.status === 'idle').length;

    const embed = new MessageEmbed()
      .setTitle(`Member Status [${guild.members.cache.size}]`)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setDescription(stripIndent`
        ${emojis.online} **Online:** \`${online}\` members
        ${emojis.dnd} **Busy:** \`${dnd}\` members
        ${emojis.idle} **AFK:** \`${afk}\` members
        ${emojis.offline} **Offline:** \`${offline}\` members
      `)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Members;
