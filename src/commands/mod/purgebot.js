const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's PurgeBot command
 * @extends Command
 */
class PurgeBot extends Command {

  /**
   * Creates instance of PurgeBot command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'purgebot',
      aliases: ['clearbot'],
      usage: 'purgebot [channel mention/ID] <message count> [reason]',
      description: oneLine`
        Sifts through the specified amount of messages in the provided channel
        and deletes all Calypso commands and messages from Calypso.
        If no channel is given, the messages will be deleted from the current channel.
        No more than 100 messages may be sifted through at a time.
        Messages older than 2 weeks old cannot be deleted.
      `,
      type: client.types.MOD,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'MANAGE_MESSAGES'],
      userPermissions: ['MANAGE_MESSAGES'],
      examples: ['purgebot 20']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    const { client, guild, member, author } = message;
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

    const prefix = client.configs.get(guild.id).prefix; // Get prefix

    await message.delete(); // Delete command message

    // Find messages
    let messages = (await message.channel.messages.fetch({ limit: amount })).filter(msg => { // Filter for commands or bot messages
      const cmd = msg.content.trim().split(/ +/g).shift().slice(prefix.length).toLowerCase();
      const command = client.commands.get(cmd) || client.aliases.get(cmd);
      if (msg.author.bot || command) return true;
    });

    if (messages.size === 0) { // No messages found

      message.channel.send(
        new MessageEmbed()
          .setTitle('Purgebot')
          .setDescription(`
            Unable to find any bot messages or commands. 
            This message will be deleted after \`10 seconds\`.
          `)
          .addField('Channel', channel, true)
          .addField('Found Messages', `\`${messages.size}\``, true)
          .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(guild.me.displayHexColor)
      ).then(msg => msg.delete({ timeout: 10000 })).catch(err => client.logger.error(err.stack));

    } else { // Purge messages

      channel.bulkDelete(messages, true).then(msgs => {
        const embed = new MessageEmbed()
          .setTitle('Purgebot')
          .setDescription(`
            Successfully deleted **${msgs.size}** message(s). 
            This message will be deleted after \`10 seconds\`.
          `)
          .addField('Channel', channel, true)
          .addField('Found Messages', `\`${msgs.size}\``, true)
          .addField('Reason', reason)
          .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
          .setTimestamp()
          .setColor(guild.me.displayHexColor);

        message.channel.send(embed).then(msg => msg.delete({ timeout: 10000 }))
          .catch(err => client.logger.error(err.stack));
      });
    }

    // Update mod log
    this.sendModLogMessage(message, reason, { Channel: channel, 'Found Messages': `\`${messages.size}\`` });
  }
}

module.exports = PurgeBot;
