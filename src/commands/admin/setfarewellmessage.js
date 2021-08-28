const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { success } = require('../../utils/emojis.json');
const { oneLine } = require('common-tags');

/**
 * Calypso's SetFarewellMessage command
 * @extends Command
 */
class SetFarewellMessage extends Command {

  /**
   * Creates instance of SetFarewellMessage command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'setfarewellmessage',
      aliases: ['setfarewellmsg', 'setfm', 'sfm'],
      usage: 'setfarewellmessage <message>',
      description: oneLine`
        Sets the message Calypso will say when someone leaves your server.
        You may use \`?member\` to substitute for a user mention,
        \`?username\` to substitute for someone's username,
        \`?tag\` to substitute for someone's full Discord tag (username + discriminator),
        and \`?size\` to substitute for your server's current member count.
        Enter no message to clear the current \`farewell message\`.
        A \`farewell channel\` must also be set to enable farewell messages.
      `,
      type: client.types.ADMIN,
      userPermissions: ['MANAGE_GUILD'],
      examples: ['setfarewellmessage ?member has left the server.']
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

    const farewellChannelId = client.configs.get(guild.id).farewellChannelId;
    const farewellChannel = guild.channels.cache.get(farewellChannelId) || none;
    const oldFarewellMessage = client.configs.get(guild.id).farewellMessage;

    // Get status
    const oldStatus = getStatus(farewellChannelId, oldFarewellMessage);

    // Get farewell message
    let farewellMessage;
    if (args[0]) {
      farewellMessage = content.slice(content.indexOf(args[0]), content.length);
      // Trim message
      if (farewellMessage && farewellMessage.length > 1024) farewellMessage = farewellMessage.slice(0, 1021) + '...';
    }

    // Update status
    const status = getStatus(farewellChannelId, farewellMessage);
    const statusUpdate = (oldStatus != status) ? `${oldStatus} ➔ ${status}` : oldStatus;

    // Update config
    await client.db.updateConfig(guild.id, 'farewellMessage', farewellMessage || null);

    const embed = new MessageEmbed()
      .setTitle('Settings: `Farewells`')
      .setDescription(`The \`farewell message\` was successfully updated. ${success}`)
      .addField('Channel', `${farewellChannel}`, true)
      .addField('Status', statusUpdate, true)
      .addField('Message', replaceKeywords(farewellMessage) || none)
      .setThumbnail(guild.iconURL({ dynamic: true }))
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SetFarewellMessage;
