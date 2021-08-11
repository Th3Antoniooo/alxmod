const { MessageEmbed } = require('discord.js');

module.exports = (client, message) => {

  const { guild, channel, member, content, author, embeds, webhookID } = message;

  // Check for webhook and that message is not empty
  if (webhookID || (!content && embeds.length === 0)) return;

  const embed = new MessageEmbed()
    .setTitle('Message Update: `Delete`')
    .setAuthor(`${author.tag}`, author.displayAvatarURL({ dynamic: true }))
    .setTimestamp()
    .setColor(guild.me.displayHexColor);

  // Message delete
  if (content) {

    // Dont send logs for starboard delete
    const starboardChannelId = client.configs.get(guild.id).starboardChannelId;
    const starboardChannel = guild.channels.cache.get(starboardChannelId);
    if (channel == starboardChannel) return;

    // Get message delete log
    const messageDeleteLogId = client.db.settings.selectMessageDeleteLogId.pluck().get(guild.id);
    const messageDeleteLog = guild.channels.cache.get(messageDeleteLogId);
    if (
      messageDeleteLog &&
      messageDeleteLog.viewable &&
      messageDeleteLog.permissionsFor(guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) {

      let trimmedContent;
      if (content.length > 1024) trimmedContent = content.slice(0, 1021) + '...';

      embed
        .setDescription(`${member}'s **message** in ${channel} was deleted.`)
        .addField('Message', trimmedContent);

      messageDeleteLog.send(embed);
    }

  // Embed delete
  } else {

    // Get message delete log
    const messageDeleteLogId = client.db.settings.selectMessageDeleteLogId.pluck().get(guild.id);
    const messageDeleteLog = guild.channels.cache.get(messageDeleteLogId);
    if (
      messageDeleteLog &&
      messageDeleteLog.viewable &&
      messageDeleteLog.permissionsFor(guild.me).has(['SEND_MESSAGES', 'EMBED_LINKS'])
    ) {

      embed
        .setTitle('Message Update: `Delete`')
        .setDescription(`${member}'s **message embed** in ${channel} was deleted.`);
      messageDeleteLog.send(embed);
    }
  }

};
