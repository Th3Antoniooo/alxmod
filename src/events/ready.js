/**
 * Ready Event
 */
module.exports = async (client) => {

  const activities = [
    { name: 'your commands', type: 'LISTENING' },
    { name: '@Calypso', type: 'LISTENING' }
  ];

  // Update presence
  client.user.setPresence({ status: 'online', activity: activities[0] });

  let activity = 1;

  // Update activity every 30 seconds
  setInterval(() => {
    activities[2] = { name: `${client.guilds.cache.size} servers`, type: 'WATCHING' }; // Update server count
    activities[3] = { name: `${client.users.cache.size} users`, type: 'WATCHING' }; // Update user count
    if (activity > 3) activity = 0;
    client.user.setActivity(activities[activity]);
    activity++;
  }, 30000);

  client.logger.info('Updating guilds...');

  // Snag models
  const { Guild, GuildMember } = client.db.models;

  // Snag actions
  const { AddGuild, RemoveGuild, AddMember, RemoveMember } = client.actions;

  for (const guild of client.guilds.cache.values()) {

    // Update cache
    await guild.members.fetch();

    const created = await AddGuild.run({ guild });

    if (created) client.logger.info(`Calypso joined ${guild.name} while offline`);

    // Grab all member IDs
    const memberIds = (await GuildMember.findAll({ where: { guildId: guild.id }})).map(row => row.userId);

    // If member left guild while offline
    for (const id of memberIds) {
      if (!guild.members.cache.has(id)) {
        await RemoveMember.run({ userId: id, guildId: guild.id });
      }
    }

    // If member joined guild while offline
    for (const member of guild.members.cache.values()) {
      if (!memberIds.includes(member.id)) {
        await AddMember.run({ member });
      }
    }
  }

  // Remove guilds left while offline
  const dbGuilds = await Guild.findAll();
  const guilds = client.guilds.cache.array();
  const leftGuilds = dbGuilds.filter(g1 => !guilds.some(g2 => g1.id === g2.id));
  for (const guild of leftGuilds) {
    await RemoveGuild.run({ guild });
    client.logger.info(`Calypso left ${guild.name} while offline`);
  }

  // Update presence
  client.user.setPresence({ status: 'online' });

  client.logger.info('Calypso is now online');
  client.logger.info(`Calypso is running on ${client.guilds.cache.size} server(s)`);
};
