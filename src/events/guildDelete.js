const { MessageEmbed } = require('discord.js');
const { fail } = require('../utils/emojis.json');

/**
 * Guild Delete Event
 */
module.exports = async (client, guild) => {

  client.logger.info(`${client.user.username} has left ${guild.name}`);
  const serverLogChannel = client.channels.cache.get(client.serverLogChannelId);
  if (serverLogChannel) {
    serverLogChannel.send(
      new MessageEmbed().setDescription(`${client.user.username} has left **${guild.name}** ${fail}`)
    );
  }

  await client.actions.RemoveGuild.run({ guild });
};
