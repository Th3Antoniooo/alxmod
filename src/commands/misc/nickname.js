const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Nickname command
 * @extends Command
 */
class Nickname extends Command {

  /**
   * Creates instance of Nickname command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'nickname',
      aliases: ['changenickname', 'nick', 'nn'],
      usage: 'nickname <nickname>',
      description: 'Changes your own nickname to the one specified. The nickname cannot be larger than 32 characters.',
      type: client.types.MISC,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_NICKNAMES'],
      userPermissions: ['CHANGE_NICKNAME'],
      examples: ['nickname Billy Zane']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, member, author, content } = message;
    const { MISSING_ARG, INVALID_ARG, COMMAND_FAIL } = this.errorTypes;

    // No nickname provided
    if (!args[0]) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a nickname');

    // Get nickname
    const nickname = content.slice(content.indexOf(args[0]), content.length);

    // Nickname too long
    if (nickname.length > 32) {
      return this.sendErrorMessage(message, INVALID_ARG, 'Please ensure the nickname is no larger than 32 characters');
    } else if (member === guild.owner) { // Can't change the nickname of the server owner
      return this.sendErrorMessage(message, INVALID_ARG, 'Unable to change the nickname of server owner');
    } else {

      try {

        // Change nickname
        const oldNickname = member.nickname || '`None`';
        const nicknameStatus = `${oldNickname} ➔ ${nickname}`;
        await member.setNickname(nickname);
        const embed = new MessageEmbed()
          .setTitle('Change Nickname')
          .setDescription(`${member}'s nickname was successfully updated.`)
          .addField('Member', member, true)
          .addField('Nickname', nicknameStatus, true)
          .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(guild.me.displayHexColor);
        channel.send(embed);

      // Unable to change nickname
      } catch (err) {
        client.logger.error(err.stack);
        this.sendErrorMessage(message, COMMAND_FAIL, 'Please check the role hierarchy', err.message);
      }
    }
  }
}

module.exports = Nickname;
