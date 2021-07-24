const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const { oneLine } = require('common-tags');

/**
 * Calypso's ThouArt command
 * @extends Command
 */
class ThouArt extends Command {

  /**
   * Creates instance of ThouArt command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'thouart',
      aliases: ['elizabethan', 'ta'],
      usage: 'thouart [user mention/ID]',
      description: oneLine`
        Says a random Elizabethan insult to the specified user. 
        If no user is given, then the insult will be directed at you!
      `,
      type: client.types.FUN,
      examples: ['thouart @Nettles'],
      cooldown: 5
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

    // Get member
    const member = this.getMemberFromMention(message, args[0]) ||
      guild.members.cache.get(args[0]) ||
      message.member;

    // Fetch insult
    try {
      const res = await fetch('http://quandyfactory.com/insult/json/');
      let insult = (await res.json()).insult;
      insult = insult.charAt(0).toLowerCase() + insult.slice(1);
      const embed = new MessageEmbed()
        .setTitle('🎭  Thou Art  🎭')
        .setDescription(`${member}, ${insult}`)
        .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      channel.send(embed);

    // Error during fetch
    } catch (err) {
      client.logger.error(err.stack);
      this.sendErrorMessage(message, this.errorTypes.COMMAND_FAIL, 'Please try again in a few seconds', err.message);
    }
  }
}

module.exports = ThouArt;
