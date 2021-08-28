/**
 * Guild Update Event
 */
module.exports = async (client, oldGuild, newGuild) => {
  if (oldGuild.name == newGuild.name) return;

  await client.actions.UpdateGuildName.run({ oldGuild, newGuild });

  client.logger.info(`${oldGuild.name} server name changed to ${newGuild.name}`);
};
