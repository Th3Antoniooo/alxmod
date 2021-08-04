const { MessageEmbed } = require('discord.js');
const { success } = require('../utils/emojis.json');

/**
 * Guild Create Event
 */
module.exports = async (client, guild) => {

  client.logger.info(`Calypso has joined ${guild.name}`);
  const serverLogChannel = client.channels.cache.get(client.serverLogChannelId);
  if (serverLogChannel) {
    serverLogChannel.send(
      new MessageEmbed().setDescription(`Calypso has joined **${guild.name}** ${success}`)
    );
  }
  const { AddGuild, AddMember } = client.actions;

  await AddGuild.run({ guild });

  // Add guild members
  for (const member of guild.members.cache.values()) {
    await AddMember.run({ member });
  }
};
