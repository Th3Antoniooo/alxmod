const Command = require('../Command.js');
const { MessageEmbed } = require('discord.js');
const { info, fun, color, points, misc, mod, admin, owner } = require('../../utils/emojis.json');
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
        Will only display commands that you have permission to access unless the \`all\` parameter is given.
      `,
      type: client.types.INFO,
      examples: ['help ping']
    });
  }
  run(message, args) {

    const all = (args[0] === 'all') ? args[0] : '';
    const { client, guild, channel, member, author } = message;
    const { INFO, FUN, COLOR, POINTS, MISC, MOD, ADMIN, OWNER } = client.types;
    const prefix = this.client.configs.get(guild.id).prefix;
    const { capitalize } = client.utils;
    const embed = new MessageEmbed();

    const emojiMap = {
      [INFO]: `${info} ${capitalize(INFO)}`,
      [FUN]: `${fun} ${capitalize(FUN)}`,
      [COLOR]: `${color} ${capitalize(COLOR)}`,
      [POINTS]: `${points} ${capitalize(POINTS)}`,
      [MISC]: `${misc} ${capitalize(MISC)}`,
      [MOD]: `${mod} ${capitalize(MOD)}`,
      [ADMIN]: `${admin} ${capitalize(ADMIN)}`,
      [OWNER]: `${owner} ${capitalize(OWNER)}`
    };

    const command = client.commands.get(args[0]) || client.aliases.get(args[0]);

    if (command && (command.type != OWNER || client.isOwner(member))) {

      embed // Build specific command help embed
        .setTitle(`Command: \`${command.name}\``)
        .setThumbnail('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png')
        .setDescription(command.description)
        .addField('Usage', `\`${prefix}${command.usage}\``, true)
        .addField('Type', `${emojiMap[command.type]} \`${capitalize(command.type)}\``, true)
        .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      if (command.aliases) embed.addField('Aliases', command.aliases.map(c => `\`${c}\``).join(' '));
      if (command.examples) embed.addField('Examples', command.examples.map(c => `\`${prefix}${c}\``).join('\n'));

    } else if (args.length > 0 && !all) {
      return this.sendErrorMessage(
        message,
        client.errorTypes.INVALID_ARG,
        'Unable to find command, please check provided command'
      );
    } else {

      // Get commands
      const commands = {};
      for (const type of Object.values(client.types)) {
        commands[type] = [];
      }

      client.commands.forEach(command => {
        if (
          command.userPermissions &&
          command.userPermissions.every(p => member.hasPermission(p)) &&
          !all ||
          (!command.userPermissions || all)
        ) {
          commands[command.type].push(`\`${command.name}\``);
        }
      });

      const total = Object.values(commands).reduce((a, b) => a + b.length, 0) - commands[OWNER].length;
      const size = client.commands.size - commands[OWNER].length;

      embed // Build help embed
        .setTitle('Calypso\'s Commands')
        .setDescription(stripIndent`
          **Prefix:** \`${prefix}\`
          **More Information:** \`${prefix}help [command]\`
          ${(!all && size != total) ? `**All Commands:** \`${prefix}help all\`` : ''}
        `)
        .setFooter(
          (!all && size != total) ?
            'Only showing available commands.\n' + member.displayName : member.displayName,
          author.displayAvatarURL({ dynamic: true })
        )
        .setTimestamp()
        .setImage('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso_Title.png')
        .setColor(guild.me.displayHexColor);

      for (const type of Object.values(client.types)) {
        if (type === OWNER && !client.isOwner(member)) continue;
        if (commands[type][0]) {
          embed.addField(`**${emojiMap[type]} [${commands[type].length}]**`, commands[type].join(' '));
        }
      }

      embed.addField(
        '**Links**',
        '**[Invite Me](https://discordapp.com/oauth2/authorize?client_id=416451977380364288&scope=bot&permissions=403008599) | ' +
        '[Support Server](https://discord.gg/pnYVdut) | ' +
        '[Repository](https://github.com/sabattle/CalypsoBot)**'
      );
    }
    channel.send(embed);
  }
};
