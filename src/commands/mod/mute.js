const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

/**
 * Calypso's Mute command
 * @extends Command
 */
class Mute extends Command {

  /**
   * Creates instance of Mute command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'mute',
      usage: 'mute <user mention/ID> <time> [reason]',
      description: 'Mutes a user for the specified amount of time (max is 14 days).',
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_ROLES'],
      userPermissions: ['MANAGE_ROLES'],
      examples: ['mute @Nettles 10s', 'mute @Nettles 30m talks too much']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, channel, author } = message;
    const { MISSING_ARG, INVALID_ARG, COMMAND_FAIL } = this.errorTypes;
    const none = '`None`';

    const muteRoleId = client.configs.get(guild.id).muteRoleId;
    let muteRole;
    if (muteRoleId) muteRole = guild.roles.cache.get(muteRoleId); // Get mute role
    else return this.sendErrorMessage(message, COMMAND_FAIL, 'There is currently no mute role set on this server');

    const member = this.getMemberFromMention(message, args[0]) || guild.members.cache.get(args[0]);

    // Invalid or missing member
    if (!member) {
      return this.sendErrorMessage(
        message, !args[0] ? MISSING_ARG : INVALID_ARG, 'Please mention a user or provide a valid user ID'
      );
    }

    // Disallow self mute
    if (member === message.member) {
      return this.sendErrorMessage(message, INVALID_ARG, 'You cannot mute yourself');
    }

    // Disallow bot mute
    if (member === guild.me) return this.sendErrorMessage(message, INVALID_ARG, 'You cannot mute me');

    // Member role higher than mod
    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return this.sendErrorMessage(message, INVALID_ARG, 'You cannot mute someone with an equal or higher role');
    }

    // Missing time
    if (!args[1]) {
      return this.sendErrorMessage(message, MISSING_ARG, 'Please enter a length of time of 14 days or less (1s/m/h/d)');
    }

    let time = ms(args[1]);

    // Invalid time
    if (!time || time > 1209600000) { // Cap at 14 days, larger than 24.8 days causes integer overflow
      return this.sendErrorMessage(message, INVALID_ARG, 'Please enter a length of time of 14 days or less (1s/m/h/d)');
    }

    // Member already muted
    if (member.roles.cache.has(muteRoleId)) {
      return this.sendErrorMessage(message, INVALID_ARG, 'Provided member is already muted');
    }

    // Reason
    let reason = args.slice(2).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    // Mute member
    try {
      await member.roles.add(muteRole);
    } catch (err) {
      client.logger.error(err.stack);
      return this.sendErrorMessage(message, COMMAND_FAIL, 'Please check the role hierarchy', err.message);
    }

    const muteEmbed = new MessageEmbed()
      .setTitle('Mute Member')
      .setDescription(`${member} has now been muted for **${ms(time, { long: true })}**.`)
      .addField('Moderator', message.member, true)
      .addField('Member', member, true)
      .addField('Time', `\`${ms(time)}\``, true)
      .addField('Reason', reason)
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(muteEmbed);

    // Unmute member
    member.timeout = client.setTimeout(async () => {
      try {
        await member.roles.remove(muteRole);
        const unmuteEmbed = new MessageEmbed()
          .setTitle('Unmute Member')
          .setDescription(`${member} has been unmuted.`)
          .setTimestamp()
          .setColor(guild.me.displayHexColor);
        channel.send(unmuteEmbed);
      } catch (err) {
        client.logger.error(err.stack);
        return this.sendErrorMessage(message, COMMAND_FAIL, 'Please check the role hierarchy', err.message);
      }
    }, time);

    // Update mod log
    this.sendModLogMessage(message, reason, { Member: member, Time: `\`${ms(time)}\`` });
  }
}

module.exports = Mute;
