const Command = require('../Command.js');
const ReactionMenu = require('../ReactionMenu.js');
const { MessageEmbed } = require('discord.js');

/**
 * Calypso's Warns command
 * @extends Command
 */
class Warns extends Command {

  /**
   * Creates instance of Warns command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'warns',
      aliases: ['warnings'],
      usage: 'warns <user mention/ID>',
      description: 'Displays a member\'s current warnings. A max of 5 warnings can be displayed at one time.',
      type: client.types.MOD,
      userPermissions: ['KICK_MEMBERS'],
      examples: ['warns @Nettles']
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
    const { MISSING_ARG, INVALID_ARG } = this.errorTypes;
    const { getRange } = client.utils;

    const member = this.getMemberFromMention(message, args[0]) || guild.members.cache.get(args[0]);

    // Invalid or missing member
    if (!member) {
      return this.sendErrorMessage(
        message, !args[0] ? MISSING_ARG : INVALID_ARG, 'Please mention a user or provide a valid user ID'
      );
    }

    // Get model
    const { Warn } = client.db.models;

    // Get warns
    const warns = await Warn.findAll({ where: { userId: member.id, guildId: guild.id }});
    const count = warns.length;

    const embed = new MessageEmbed()
      .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
      .setFooter(message.member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    // Build warn embed function
    const buildEmbed = (current, embed) => {
      const max = (count > current + 5) ? current + 5 : count;
      let amount = 0;
      for (let i = current; i < max; i++) {
        embed // Build warn list
          .addField('\u200b', `**Warn \`#${i + 1}\`**`)
          .addField('Reason', warns[i].reason)
          .addField(
            'Moderator',
            guild.members.cache.get(warns[i].mod) || '`Unable to find moderator`',
            true
          )
          .addField('Date Issued', warns[i].date, true);
        amount += 1;
      }

      return embed
        .setTitle('Warn List ' + getRange(warns, current, 5))
        .setDescription(`Showing \`${amount}\` of ${member}'s \`${count}\` total warns.`);
    };

    if (count == 0) {
      channel.send(embed
        .setTitle('Warn List [0]')
        .setDescription(`${member} currently has no warns.`)
      );
    } else if (count < 5) channel.send(buildEmbed(0, embed));
    else {

      // Override all reaction menu functionality
      let n = 0;
      const json = embed.setFooter(
        'Expires after three minutes.\n' + message.member.displayName,
        author.displayAvatarURL({ dynamic: true })
      ).toJSON();

      const first = () => {
        if (n === 0) return;
        n = 0;
        return buildEmbed(n, new MessageEmbed(json));
      };

      const previous = () => {
        if (n === 0) return;
        n -= 5;
        if (n < 0) n = 0;
        return buildEmbed(n, new MessageEmbed(json));
      };

      const next = () => {
        const cap = count - (count % 5);
        if (n === cap || n + 5 === count) return;
        n += 5;
        if (n >= count) n = cap;
        return buildEmbed(n, new MessageEmbed(json));
      };

      const last = () => {
        const cap = count - (count % 5);
        if (n === cap || n + 5 === count) return;
        n = cap;
        if (n === count) n -= 5;
        return buildEmbed(n, new MessageEmbed(json));
      };

      const reactions = {
        '⏪': first,
        '◀️': previous,
        '▶️': next,
        '⏩': last,
        '⏹️': null,
      };

      // Create reaction menu
      const menu = new ReactionMenu(client, {
        channel,
        member: message.member,
        embed: buildEmbed(n, new MessageEmbed(json)),
        reactions,
        timeout: 180000
      });

      menu.reactions['⏹️'] = menu.stop.bind(menu);

    }
  }
}

module.exports = Warns;
