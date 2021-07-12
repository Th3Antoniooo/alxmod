const { MessageEmbed } = require('discord.js');
const { oneLine } = require('common-tags');

/**
 * Message Event
 */
module.exports = (client, message) => {
  const { guild, channel, content, author } = message;
  if (channel.type === 'dm' || !client.isAllowed(channel) || author.bot) return;

  // Command handler
  const prefix = client.configs.get(guild.id).prefix;
  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})\\s*`);

  if (prefixRegex.test(content)) {

    const [, match] = content.match(prefixRegex);
    const args = content.slice(match.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    let command = client.commands.get(cmd) || client.aliases.get(cmd); // If command not found, check aliases

    if (command && command.checkPermissions(message)) {
      const cooldown = command.getOrCreateCooldown(author.id);
      if (cooldown) return command.sendCooldownMessage(message, cooldown);
      return command.run(message, args); // Run command

    // Send help message
    } else if (content === `<@${client.user.id}>` || content === `<@!${client.user.id}>`) {
      const embed = new MessageEmbed()
        .setTitle(`Hi, I'm ${guild.me.displayName}. Need help?`)
        .setThumbnail('https://raw.githubusercontent.com/sabattle/CalypsoBot/develop/data/images/Calypso.png')
        .setDescription(`You can see everything I can do by using the \`${prefix}help\` command.`)
        .addField('Invite Me', oneLine`
          You can add me to your server by clicking 
          [here](https://discordapp.com/oauth2/authorize?client_id=416451977380364288&scope=bot&permissions=403008599)!
        `)
        .addField('Support', oneLine`
          If you have questions, suggestions, or found a bug, please join the 
          [Calypso Support Server](https://discord.gg/pnYVdut)!
        `)
        .setFooter('DM Nettles#8880 to speak directly with the developer!')
        .setColor(guild.me.displayHexColor);
      channel.send(embed);
    }
  }
};

