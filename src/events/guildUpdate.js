/**
 * Guild Update Event
 */
module.exports = async (client, oldGuild, newGuild) => {
  if (oldGuild.name == newGuild.name) return;

  // Update guild name
  const { Guild } = client.db.models;
  const guild = await Guild.findOne({ where: { guildId: oldGuild.id }});
  guild.name = newGuild.name;
  await guild.save();

  client.logger.info(`${oldGuild.name} server name changed to ${newGuild.name}`);
};
