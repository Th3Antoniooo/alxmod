const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine, stripIndent } = require('common-tags');

module.exports = class Aliases extends Command {
  constructor(client) {
    super(client, {
      name: 'aliases',
      aliases: ['alias', 'ali', 'a'],
      usage: 'aliases [command type]',
      description: oneLine`
        Displays a list of all current aliases for the given command type. 
        If no command type is given, the amount of aliases for every type will be displayed.
      `,
      type: client.types.INFO,
      examples: ['aliases Info']
    });
  }
  run(message, args) {

    const embed = new MessageEmbed();

    const type = args[0] ? args[0].toLowerCase() : '';
    const types = Object.values(client.types);
    const { capitalize } = client.utils;

    // List aliases for specific type
    if (type && types.includes(type)) {

      const aliases = [];

      let total = 0;
      client.commands.filter(command => command.type === type).forEach(command => {
        if (command.ownerOnly && !client.isOwner(message.author)) return;
        if (command.aliases && command.type === type) {
          aliases.push(`**${command.name}:** ${command.aliases.map(a => `\`${a}\``).join(' ')}`);
          total += command.aliases.length;
        }
      });

      embed
        .setTitle(`Alias Type: \`${capitalize(type)}\``)
        .addField(`**[${total}]**`, aliases.join('\n'))
        .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(message.guild.me.displayHexColor);

    // Invalid alias type provided
    } else if (type) {
      return this.sendErrorMessage(
        message, this.errorTypes.INVALID_ARG, 'Unable to find alias type, please check provided type'
      );

    // List all alias types
    } else {

      const aliases = {};
      for (const type of Object.values(client.types)) {
        aliases[type] = 0;
      }

      client.commands.forEach(command => {
        if (!command.ownerOnly || client.isOwner(message.author)) {
          if (command.aliases) {
            // eslint-disable-next-line no-unused-vars
            for (const alias of command.aliases) aliases[command.type]++;
          }
        }
      });

      const { prefix } = client;

      embed
        .setTitle('Alias Types')
        .setDescription(stripIndent`
          **Prefix:** \`${prefix}\`
          **More Information:** \`${prefix}${this.name} [command type]\`
        `)
        .setFooter(message.member.displayName, message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(message.guild.me.displayHexColor);

      for (const type of Object.keys(aliases)) {
        if (aliases[type] > 0) {
          embed.addField(oneLine`
            **${capitalize(type)}**`, `\`${aliases[type]}\` alias${aliases[type] > 1 ? 'es' : ''}
          `, true);
        }
      }
    }

    message.channel.send(embed);
  }
};
