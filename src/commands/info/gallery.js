const Command = require('../Command.js');
const ReactionMenu = require('../ReactionMenu.js');
const { MessageEmbed } = require('discord.js');

const art = [
  'https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso_Full_Signature.png',
  'https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png',
  'https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso_WIP.png',
  'https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso_WIP_2.png',
  'https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso_WIP_3.png'
];

/**
 * Calypso's Gallery command
 * @extends Command
 */
class Gallery extends Command {

  /**
   * Creates instance of Gallery command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'gallery',
      aliases: ['art'],
      usage: 'gallery',
      description: 'Displays a gallery of Calypso\'s art.',
      type: client.types.INFO,
      clientPermissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'ADD_REACTIONS']
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

    let n = 0;

    // Create gallery
    const embed = new MessageEmbed()
      .setTitle('Art Gallery')
      .setDescription('All art courtesy of **CommradeFido#5286**.')
      .setImage(art[n])
      .setFooter(
        'Expires after three minutes.\n' + member.displayName,
        author.displayAvatarURL({ dynamic: true })
      )
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    const json = embed.toJSON();

    // Create previous and next functions
    const previous = () => {
      (n <= 0) ? n = art.length - 1 : n--;
      return new MessageEmbed(json).setImage(art[n]);
    };
    const next = () => {
      (n >= art.length - 1) ? n = 0 : n++;
      return new MessageEmbed(json).setImage(art[n]);
    };

    const reactions = {
      '◀️': previous,
      '▶️': next,
      '⏹️': null,
    };

    // Create reaction menu
    const menu = new ReactionMenu(
      client,
      channel,
      member,
      embed,
      null,
      null,
      reactions,
      180000
    );

    // Add a stop button
    menu.reactions['⏹️'] = menu.stop.bind(menu);
  }
}

module.exports = Gallery;
