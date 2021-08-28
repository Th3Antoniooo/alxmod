/**
 * Message Delete Event
 */
module.exports = async (client, message) => {

  const { guild, channel, content, embeds, webhookID } = message;

  // Check for webhook and that message is not empty
  if (webhookID || (!content && embeds.length === 0)) return;

  // Dont send logs for starboard edits
  const starboardChannelId = client.configs.get(guild.id).starboardChannelId;
  const starboardChannel = guild.channels.cache.get(starboardChannelId);
  if (channel == starboardChannel) return;

  await client.botLogger.sendMessageDeleteLog(message);
};
