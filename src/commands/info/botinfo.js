const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { version, dependencies } = require(__basedir + '/package.json');
const { owner } = require('../../utils/emojis.json');
const { oneLine, stripIndent } = require('common-tags');

/**
 * Calypso's BotInfo command
 * @extends Command
 */
class BotInfo extends Command {

  /**
   * Creates instance of BotInfo command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'botinfo',
      aliases: ['bot', 'bi'],
      usage: 'botinfo',
      description: 'Fetches Calypso\'s bot information.',
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

    const { client, guild, channel, member, author } = message;

    // Get bot information
    const botOwners = [];
    client.ownerIds.forEach(id => botOwners.push(client.users.cache.get(id))); // Get each owner
    const prefix = client.configs.get(guild.id).prefix;
    const tech = stripIndent`
      Version     :: ${version}
      Library     :: Discord.js v${dependencies['discord.js'].substring(1)}
      Environment :: Node.js ${process.version}
      Database    :: SQLite
    `;

    const embed = new MessageEmbed()
      .setTitle('Calypso\'s Bot Information')
      .setDescription(oneLine`
        Calypso is an open source, fully customizable Discord bot that is constantly growing.
        She comes packaged with a variety of commands and 
        a multitude of settings that can be tailored to your server's specific needs. 
        Her codebase also serves as a base framework to easily create Discord bots of all kinds.
        She first went live on **February 22nd, 2018**.
      `)
      .addField('Prefix', `\`${prefix}\``, true)
      .addField('Client ID', `\`${client.user.id}\``, true)
      .addField(`Developers ${owner}`, botOwners.join('\n'), true)
      .addField('Tech', `\`\`\`asciidoc\n${tech}\`\`\``)
      .addField(
        'Links',
        '**[Invite Me](https://discordapp.com/oauth2/authorize?client_id=416451977380364288&scope=bot&permissions=403008599) | ' +
        '[Support Server](https://discord.gg/pnYVdut) | ' +
        '[Repository](https://github.com/sabattle/CalypsoBot)**'
      )
      .setImage('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso_Title.png')
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    channel.send(embed);
  }
}

module.exports = BotInfo;
