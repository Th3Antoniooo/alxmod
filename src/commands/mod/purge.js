const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's Purge command
 * @extends Command
 */
class Purge extends Command {

  /**
   * Creates instance of Purge command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'purge',
      aliases: ['clear'],
      usage: 'purge [channel mention/ID] [user mention/ID] <message count> [reason]',
      description: oneLine`
        Deletes the specified amount of messages from the provided channel. 
        If no channel is given, the messages will be deleted from the current channel.
        If a member is provided, only their messages will be deleted from the batch.
        No more than 100 messages may be deleted at a time.
        Messages older than 2 weeks old cannot be deleted.
      `,
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      examples: ['purge 20', 'purge #general 10', 'purge @Nettles 50', 'purge #general @Nettles 5']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, author } = message;
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;
    const none = '`None`';

    // Get channel
    let channel = this.getChannelFromMention(message, args[0]) || guild.channels.cache.get(args[0]);
    if (channel) {
      args.shift();
    } else channel = message.channel;

    // Check channel
    if (!client.isAllowed(channel)) {
      return this.sendErrorMessage(
        message, INVALID_ARG, 'Please mention an accessible text channel or provide a valid text channel ID'
      );
    }

    // Get member
    let member = this.getMemberFromMention(message, args[0]) || guild.members.cache.get(args[0]);
    if (member) {
      args.shift();
    }

    // Get amount
    const amount = parseInt(args[0]);
    if (isNaN(amount) === true || !amount || amount < 0 || amount > 100) { // Invalid amount
      return this.sendErrorMessage(
        message, !args[0] ? MISSING_ARG : INVALID_ARG, 'Please provide a message count between 1 and 100'
      );
    }

    // Check channel permissions
    if (!channel.permissionsFor(guild.me).has(['MANAGE_MESSAGES'])) {
      return this.sendErrorMessage(
        message,
        INVALID_ARG,
        'I do not have permission to manage messages in the provided channel'
      );
    }

    // Reason
    let reason = args.slice(1).join(' ');
    if (!reason) reason = none;
    if (reason.length > 1024) reason = reason.slice(0, 1021) + '...';

    await message.delete(); // Delete command message

    // Find member messages if given
    let messages;
    if (member) {
      messages = (await channel.messages.fetch({ limit: amount })).filter(m => m.member.id === member.id);
    } else messages = amount;

    if (messages.size === 0) { // No messages found

      message.channel.send(
        new MessageEmbed()
          .setTitle('Purge')
          .setDescription(`
            Unable to find any messages from ${member}. 
            This message will be deleted after \`10 seconds\`.
          `)
          .addField('Channel', channel, true)
          .addField('Member', member)
          .addField('Found Messages', `\`${messages.size}\``, true)
          .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(guild.me.displayHexColor)
      ).then(msg => msg.delete({ timeout: 10000 })).catch(err => client.logger.error(err.stack));

    } else { // Purge messages

      channel.bulkDelete(messages, true).then(messages => {
        const embed = new MessageEmbed()
          .setTitle('Purge')
          .setDescription(`
            Successfully deleted **${messages.size}** message(s). 
            This message will be deleted after \`10 seconds\`.
          `)
          .addField('Channel', channel, true)
          .addField('Message Count', `\`${messages.size}\``, true)
          .addField('Reason', reason)
          .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(guild.me.displayHexColor);

        if (member) {
          embed
            .spliceFields(1, 1, { name: 'Found Messages', value:  `\`${messages.size}\``, inline: true })
            .spliceFields(1, 0, { name: 'Member', value: member, inline: true });
        }

        message.channel.send(embed).then(msg => msg.delete({ timeout: 10000 }))
          .catch(err => client.logger.error(err.stack));
      });
    }

    // Update mod log
    const fields = {
      Channel: channel
    };

    if (member) {
      fields['Member'] = member;
      fields['Found Messages'] = `\`${messages.size}\``;
    } else fields['Message Count'] = `\`${amount}\``;

    this.sendModLogMessage(message, reason, fields);

  }
}

module.exports = Purge;
