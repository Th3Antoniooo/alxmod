const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const rgx = /^(?:<@!?)?(\d+)>?$/;

/**
 * Calypso's LeaveServer command
 * @extends Command
 */
class LeaveServer extends Command {

  /**
   * Creates instance of LeaveServer command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'leaveserver',
      usage: 'leaveserver <server ID>',
      description: 'Forces Calypso to leave the specified server.',
      type: client.types.OWNER,
      ownerOnly: true,
      examples: ['leaveserver 709992782252474429']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message, args) {

    // Check arguments
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;
    if (args.length === 0) return this.sendErrorMessage(message, MISSING_ARG, 'Please provide a server ID');
    const guildId = args[0];
    if (!rgx.test(guildId)) return this.sendErrorMessage(message, INVALID_ARG, 'Please provide a valid server ID');
    const guild = message.client.guilds.cache.get(guildId);
    if (!guild) {
      return this.sendErrorMessage(message, INVALID_ARG, 'Unable to find server, please check the provided ID');
    }

    const { channel, member, author } = message;

    await guild.leave(); // Leave server

    const embed = new MessageEmbed()
      .setTitle('Leave Server')
      .setDescription(`I have successfully left **${guild.name}**.`)
      .setFooter(member.displayName,  author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(message.guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = LeaveServer;
