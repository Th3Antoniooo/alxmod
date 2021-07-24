const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Topics command
 * @extends Command
 */
class Topics extends Command {

  /**
   * Creates instance of Topics command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'topics',
      aliases: ['triviatopics', 'categories', 'ts'],
      usage: 'topics',
      description: 'Displays the list of all available trivia topics.',
      type: client.types.FUN
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message) {

    const { client, guild, channel, member, author } = message;

    const prefix = client.configs.get(guild.id).prefix; // Get prefix

    // Get all topics
    const topics = [];
    client.topics.forEach(topic => {
      topics.push(`\`${topic}\``);
    });

    const embed = new MessageEmbed()
      .setTitle('Trivia Topics')
      .setDescription(`${topics.join(' ')}\n\nType \`${prefix}trivia [topic]\` to choose one.`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = Topics;
