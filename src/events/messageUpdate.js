/**
 * Message Update Event
 */
module.exports = async (client, oldMessage, newMessage) => {

  const { guild, channel, member } = newMessage;

  // Detect edited commands
  if (
    member &&
    newMessage.id === member.lastMessageID &&
    !oldMessage.command
  ) {
    client.emit('message', newMessage);
  }

  // Dont send logs for starboard edits
  const starboardChannelId = client.configs.get(guild.id).starboardChannelId;
  const starboardChannel = guild.channels.cache.get(starboardChannelId);
  if (channel == starboardChannel) return;

  // Content change
  if (oldMessage.content != newMessage.content) {
    await client.botLogger.sendMessageEditLog(oldMessage, newMessage);
  }

  // Embed delete
  if (oldMessage.embeds.length > newMessage.embeds.length) {
    await client.botLogger.sendMessageEmbedDeleteLog(oldMessage, newMessage);
  }
};
