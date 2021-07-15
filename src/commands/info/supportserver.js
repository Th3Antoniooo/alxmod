const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's SupportServer command
 * @extends Command
 */
class SupportServer extends Command {

  /**
   * Creates instance of SupportServer command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'supportserver',
      aliases: ['support', 'ss'],
      usage: 'supportserver',
      description: 'Displays the invite link to Calypso\'s Discord Support Server.',
      type: client.types.INFO
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message) {
    const { guild, channel, member, author } = message;
    const embed = new MessageEmbed()
      .setTitle('Support Server')
      .setThumbnail('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png')
      .setDescription('Click [here](https://discord.gg/pnYVdut) to join the Calypso Support Server!')
      .addField('Other Links',
        '**[Invite Me](https://discordapp.com/oauth2/authorize?client_id=416451977380364288&scope=bot&permissions=403008599) | ' +
        '[Repository](https://github.com/sabattle/CalypsoBot)**'
      )
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = SupportServer;
