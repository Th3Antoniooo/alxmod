const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { pong } = require('../../utils/emojis.json');

/**
 * Calypso's Ping command
 * @extends Command
 */
class Ping extends Command {

  /**
   * Creates instance of Ping command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'ping',
      usage: 'ping',
      description: 'Gets Calypso\'s current latency and API latency.',
      type: client.types.INFO,
      cooldown: 5
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  async run(message) {

    const { client, guild, channel, member, author } = message;

    // Send initial embed
    const embed = new MessageEmbed()
      .setDescription('`Pinging...`')
      .setColor(guild.me.displayHexColor);
    const msg = await channel.send(embed);

    // Get ping
    const timestamp = (message.editedTimestamp) ? message.editedTimestamp : message.createdTimestamp; // Check if edited
    const latency = `\`\`\`ini\n[ ${Math.floor(msg.createdTimestamp - timestamp)}ms ]\`\`\``;
    const apiLatency = `\`\`\`ini\n[ ${Math.round(client.ws.ping)}ms ]\`\`\``;

    // Edit embed
    embed.setTitle(`Pong!  ${pong}`)
      .setDescription('')
      .addField('Latency', latency, true)
      .addField('API Latency', apiLatency, true)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp();
    msg.edit(embed);
  }
}

module.exports = Ping;
