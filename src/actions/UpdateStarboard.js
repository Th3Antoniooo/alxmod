const Action = require('../Action.js');
const { MessageEmbed } = require('discord.js');

const emojis = ['⭐', '🌟', '✨', '💫', '☄️'];

class UpdateStarboard extends Action {
  constructor(client) {
    super(client);
  }
  async run({ message, amount }) {

    const { client, guild, channel, author, content, attachments, embeds, url, id } = message;

    const starboardChannelId = client.configs.get(guild.id).starboardChannelId;
    const starboardChannel = guild.channels.cache.get(starboardChannelId);
    if (!client.isAllowed(channel) || channel === starboardChannel) return;

    const messages = await starboardChannel.messages.fetch({ limit: 100 });
    const starred = messages.find(m => {
      return emojis.some(e => {
        return m.content.startsWith(e) &&
          m.embeds[0] &&
          m.embeds[0].footer &&
          m.embeds[0].footer.text == id;
      });
    });

    // If message already in starboard
    if (starred) {

      const starCount = parseInt(starred.content.split(' ')[1].slice(2)) + amount;

      // Determine emoji type
      let emojiType;
      if (starCount > 20) emojiType = emojis[4];
      else if (starCount > 15) emojiType = emojis[3];
      else if (starCount > 10) emojiType = emojis[2];
      else if (starCount > 5) emojiType = emojis[1];
      else emojiType = emojis[0];

      const starMessage = await starboardChannel.messages.fetch(starred.id);
      await starMessage.edit(`${emojiType} **${starCount}  |**  ${channel}`)
        .catch(err => client.logger.error(err.stack));

      if (starCount == 0) await starMessage.delete().catch(err => client.logger.error(err.stack));

    // New starred message
    } else {

      // Check for attachment image
      let image = '';
      const attachment = attachments.array()[0];
      if (attachment && attachment.url) {
        const extension = attachment.url.split('.').pop();
        if (/(jpg|jpeg|png|gif)/gi.test(extension)) image = attachment.url;
      }

      // Check for url
      if (!image && embeds[0] && embeds[0].url) {
        const extension = embeds[0].url.split('.').pop();
        if (/(jpg|jpeg|png|gif)/gi.test(extension)) image = embeds[0].url;
      }

      if (!content && !image) return;

      const embed = new MessageEmbed()
        .setAuthor(author.tag, author.displayAvatarURL({ dynamic: true }))
        .setDescription(content)
        .addField('Original', `[Jump!](${url})`)
        .setImage(image)
        .setTimestamp()
        .setFooter(id)
        .setColor('#ffac33');
      await starboardChannel.send(`⭐ **1  |**  ${channel}`, embed);
    }
  }
}

module.exports = UpdateStarboard;
