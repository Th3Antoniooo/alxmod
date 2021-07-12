const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { oneLine, stripIndent } = require('common-tags');

module.exports = class Help extends Command {
  constructor(client) {
    super(client, {
      name: 'help',
      aliases: ['commands', 'h'],
      usage: 'help [command]',
      description: oneLine`
        Displays a list of all current commands, sorted by category. 
        Can be used in conjunction with a command for additional information.
      `,
      type: client.types.INFO,
      examples: ['help ping']
    });
  }
  run(message, args) {

    const embed = new MessageEmbed();
    const { guild } = message;
    const prefix = this.client.configs.get(guild.id).prefix;
    const { capitalize } = client.utils;

    const command = client.commands.get(args[0]) || client.aliases.get(args[0]);

    // Specific command information
    if (
      command &&
      (!command.ownerOnly || client.isOwner(message.author))
    ) {

      embed // Build specific command help embed
        .setTitle(`Command: \`${command.name}\``)
        .setDescription(command.description)
        .addField('Usage', `\`${prefix}${command.usage}\``, true)
        .addField('Type', `\`${capitalize(command.type)}\``, true)
        .setFooter(message.member.displayName,  message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      if (command.aliases) embed.addField('Aliases', command.aliases.map(c => `\`${c}\``).join(' '));
      if (command.examples) embed.addField('Examples', command.examples.map(c => `\`${prefix}${c}\``).join('\n'));

    // Invalid command provided
    } else if (args.length > 0) {
      return this.sendErrorMessage(
        message, this.errorTypes.INVALID_ARG, 'Unable to find command, please check provided command'
      );

    // Show all commands
    } else {

      // Get commands
      const commands = {};
      for (const type of Object.values(client.types)) {
        commands[type] = [];
      }

      client.commands.forEach(command => {
        if (!command.ownerOnly || client.isOwner(message.author)) {
          commands[command.type].push(`\`${command.name}\``);
        }
      });

      embed // Build help embed
        .setTitle(`${guild.me.displayName}'s Commands`)
        .setDescription(stripIndent`
          **Prefix:** \`${prefix}\`
          **More Information:** \`${prefix}${this.name} [command]\`
        `)
        .setFooter(
          message.member.displayName,
          message.author.displayAvatarURL({ dynamic: true })
        )
        .setTimestamp()
        .setColor(guild.me.displayHexColor);

      for (const type of Object.keys(commands)) {
        if (commands[type][0]) {
          embed.addField(`** ${capitalize(type)} [${commands[type].length}]**`, commands[type].join(' '));
        }
      }
    }

    message.channel.send(embed);
  }
};
