const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { mem, cpu, os } = require('node-os-utils');
const { stripIndent } = require('common-tags');

/**
 * Calypso's Stats command
 * @extends Command
 */
class Stats extends Command {

  /**
   * Creates instance of Stats command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'stats',
      aliases: ['statistics', 'metrics'],
      usage: 'stats',
      description: 'Fetches Calypso\'s statistics. Can take a few seconds to run.',
      type: client.types.INFO,
      cooldown: 10
    });
  }

  /**
	 * Fetches the current memory usage of the process in MB
	 * @returns {number}
	 */
  _getRamUsed() {
    return Math.round(((process.memoryUsage().heapUsed / 1024 / 1024) * 100)) / 100;
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
      .setDescription('`Fetching statistics...`')
      .setColor(guild.me.displayHexColor);
    const msg = await channel.send(embed);

    // Get uptime
    const d = moment.duration(client.uptime);
    const days = (d.days() == 1) ? `${d.days()} day` : `${d.days()} days`;
    const hours = (d.hours() == 1) ? `${d.hours()} hour` : `${d.hours()} hours`;

    // Build stats
    const clientStats = stripIndent`
      Servers   :: ${client.guilds.cache.size}
      Users     :: ${client.users.cache.size}
      Channels  :: ${client.channels.cache.size}
      WS Ping   :: ${Math.round(client.ws.ping)}ms
      Uptime    :: ${days} and ${hours}
    `;
    const { totalMemMb } = await mem.info(); // Get meminfo
    const serverStats = stripIndent`
      OS        :: ${await os.oos()}
      CPU       :: ${cpu.model()}
      Cores     :: ${cpu.count()}
      CPU Usage :: ${await cpu.usage()} %
      RAM       :: ${totalMemMb} MB
      RAM Usage :: ${this._getRamUsed()} MB 
    `;

    // Edit embed
    embed.description = null; // Clear description
    embed
      .setTitle('Calypso\'s Statistics')
      .addField('Commands', `\`${client.commands.size}\` commands`, true)
      .addField('Aliases', `\`${client.aliases.size}\` aliases`, true)
      .addField('Command Types', `\`${Object.keys(client.types).length}\` command types`, true)
      .addField('Client', `\`\`\`asciidoc\n${clientStats}\`\`\``)
      .addField('Server', `\`\`\`asciidoc\n${serverStats}\`\`\``)
      .addField(
        'Links',
        '**[Invite Me](https://discordapp.com/oauth2/authorize?client_id=416451977380364288&scope=bot&permissions=403008599) | ' +
        '[Support Server](https://discord.gg/pnYVdut) | ' +
        '[Repository](https://github.com/sabattle/CalypsoBot)**'
      )
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);
    await msg.edit(embed);
  }
}

module.exports = Stats;
