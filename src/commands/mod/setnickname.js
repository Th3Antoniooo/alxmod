const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetNickname command
 * @extends Command
 */
class SetNickname extends Command {

  /**
   * Creates instance of SetNickname command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setnickname',
      aliases: ['setnn', 'snn'],
      usage: 'setnickname <user mention/ID> <nickname> [reason]',
      description: oneLine`
        Changes the provided user's nickname to the one specified.
        Surround the new nickname in quotes if it is more than one word.
        The nickname cannot be larger than 32 characters.
      `,
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_NICKNAMES'],
      userPermissions: ['MANAGE_NICKNAMES'],
      examples: ['setnickname @Nettles Noodles', 'setnickname @Nettles "Val Kilmer"']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, author, content } = message;
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;
    const none = '`None`';

    const member = this.getMemberFromMention(message, args[0]) || guild.members.cache.get(args[0]);

    // Invalid or missing member
    if (!member) {
      return this.sendErrorMessage(
        message, !args[0] ? MISSING_ARG : INVALID_ARG, 'Please mention a user or provide a valid user ID'
      );
    }

    // Member role higher than mod
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'You cannot change the nickname of someone with an equal or higher role'
      );
    }

    // Multi-word nickname
    let nickname = args[1];
    if (nickname.startsWith('"')) {
      nickname = content.slice(content.indexOf(args[1]) + 1);

      // Invalid nickname
      if (!nickname.includes('"')) {
        return this.sendErrorMessage(message, INVALID_ARG, 'Please ensure the nickname is surrounded in quotes');
      }

      nickname = nickname.slice(0, nickname.indexOf('"'));

      // No nickname provided
      if (!nickname.replace(/\s/g, '').length) {
        return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a nickname');
      }
    }

    // Nickname too long
    if (nickname.length > 32) {
      return this.sendErrorMessage(message, INVALID_ARG, 'Please ensure the nickname is no larger than 32 characters');

    } else {

      // Reason
      let reason;
      if (args[1].startsWith('"')) {
        reason = content.slice(content.indexOf(nickname) + nickname.length + 1);
      } else reason = content.slice(content.indexOf(nickname) + nickname.length);
      if (!reason) reason = none;
      if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

      try {

        // Change nickname
        const oldNickname = member.nickname || '`None`';
        const nicknameStatus = `${oldNickname} ➔ ${nickname}`;
        await member.setNickname(nickname);
        const embed = new MessageEmbed()
          .setTitle('Set Nickname')
          .setDescription(`${member}'s nickname was successfully updated.`)
          .addField('Moderator', message.member, true)
          .addField('Member', member, true)
          .addField('Nickname', nicknameStatus, true)
          .addField('Reason', reason)
          .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(guild.me.displayHexColor);
        channel.send(embed);

        // Update mod log
        this.sendModLogMessage(message, reason, { Member: member, Nickname: nicknameStatus });

      } catch (err) {
        client.logger.error(err.stack);
        this.sendErrorMessage(message, 1, 'Please check the role hierarchy', err.message);
      }
    }
  }
}

module.exports = SetNickname;
