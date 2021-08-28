const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetWelcomeMessage command
 * @extends Command
 */
class SetWelcomeMessage extends Command {

  /**
   * Creates instance of SetWelcomeMessage command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setwelcomemessage',
      aliases: ['setwelcomemsg', 'setwm', 'swm'],
      usage: 'setwelcomemessage <message>',
      description: oneLine`
        Sets the message Calypso will say when someone joins your server.
        You may use \`?member\` to substitute for a user mention,
        \`?username\` to substitute for someone's username,
        \`?tag\` to substitute for someone's full Discord tag (username + discriminator),
        and \`?size\` to substitute for your server's current member count.
        Enter no message to clear the current \`welcome message\`.
        A \`welcome channel\` must also be set to enable welcome messages.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setwelcomemessage ?member has joined the server!']
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
    const { getStatus, replaceKeywords } = client.utils;
    const none = '`None`';

    const welcomeChannelId = client.configs.get(guild.id).welcomeChannelId;
    const welcomeChannel = guild.channels.cache.get(welcomeChannelId) || none;
    const oldWelcomeMessage = client.configs.get(guild.id).welcomeMessage;

    // Get status
    const oldStatus = getStatus(welcomeChannelId, oldWelcomeMessage);

    // Get welcome message
    let welcomeMessage;
    if (args[0]) {
      welcomeMessage = content.slice(content.indexOf(args[0]), content.length);
      // Trim message
      if (welcomeMessage && welcomeMessage.length > 1024) welcomeMessage = welcomeMessage.slice(0, 1021) + '...';
    }

    // Update status
    const status = getStatus(welcomeChannelId, welcomeMessage);
    const statusUpdate = (oldStatus != status) ? `${oldStatus} ➔ ${status}` : oldStatus;

    // Update config
    await client.db.updateConfig(guild.id, 'welcomeMessage', welcomeMessage || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Welcomes`')
      .setDescription(`The \`welcome message\` was successfully updated. ${success}`)
      .addField('Channel', `${welcomeChannel}`, true)
      .addField('Status', statusUpdate, true)
      .addField('Message', replaceKeywords(welcomeMessage) || none)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetWelcomeMessage;
