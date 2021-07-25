const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Calypso's ReportBug command
 * @extends Command
 */
class ReportBug extends Command {

  /**
   * Creates instance of ReportBug command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'reportbug',
      aliases: ['bugreport', 'report', 'bug', 'rb', 'br'],
      usage: 'reportbug <message>',
      description: oneLine`
        Sends a message to the Calypso Support Server's bug report channel.
        When reporting a bug, please include as much information as possible.
      `,
      type: client.types.MISC,
      examples: ['reportbug bot is botched']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {

    const { client, guild, channel, member, author, content } = message;
    const { MISSING_ARG, COMMAND_FAIL } = this.errorTypes;

    // Get bug report channel
    const reportChannel = client.channels.cache.get(client.bugReportChannelId);
    if (!reportChannel) {
      return this.sendErrorMessage(message, COMMAND_FAIL, 'The bugReportChannelId property has not been set');
    }

    // No bug report provided
    if (!args[0]) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a message to send');

    // Get bug report
    let report = content.slice(content.indexOf(args[0]), content.length);

    // Send report
    const reportEmbed = new MessageEmbed()
      .setTitle('Bug Report')
      .setThumbnail(reportChannel.guild.iconURL({ dynamic: true }))
      .setDescription(report)
      .addField('User', member, true)
      .addField('Server', guild.name, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    reportChannel.send(reportEmbed);

    // Send response
    if (report.length > 1024) report = report.slice(0, 1021) + '...';
    const embed = new MessageEmbed()
      .setTitle('Bug Report')
      .setThumbnail('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png')
      .setDescription(oneLine`
        Successfully sent bug report!
        Please join the [Calypso Support Server](https://discord.gg/pnYVdut) to further discuss your issue.
        Additionally, feel free to submit an issue on [GitHub](https://github.com/sabattle/CalypsoBot/issues).
      `)
      .addField('Member', member, true)
      .addField('Message', report)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = ReportBug;
