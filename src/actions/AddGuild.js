const Action = require('../Action.js');

class AddGuild extends Action {
  constructor(client) {
    super(client);
  }

  async _findRoles(guild) {

    // Find mod log
    const modLog = guild.channels.cache.find(c => c.name.replace('-', '').replace('s', '') === 'modlog' ||
      c.name.replace('-', '').replace('s', '') === 'moderatorlog');

    // Find admin and mod roles
    const adminRole =
      guild.roles.cache.find(r => r.name.toLowerCase() === 'admin' || r.name.toLowerCase() === 'administrator');
    const modRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'mod' || r.name.toLowerCase() === 'moderator');

    // Create mute role if it doesn't exist
    let muteRole = guild.roles.cache.find(r => r.name.toLowerCase() === 'muted');
    if (!muteRole) muteRole = await this._createMuteRole(guild);

    // Create crown role if it doesn't exist
    let crownRole = guild.roles.cache.find(r => r.name === 'The Crown');
    if (!crownRole) crownRole = await this._createCrownRole(guild);

    return { modLog, adminRole, modRole, muteRole, crownRole };
  }

  async _createMuteRole(guild) {

    if (guild.me.hasPermission('MANAGE_ROLES')) return;

    // Create mute role
    let muteRole;
    try {
      muteRole = await guild.roles.create({
        data: {
          name: 'Muted',
          permissions: []
        }
      });
    } catch (err) {
      this._client.logger.error(err.message);
    }

    // Update role channel permissions
    for (const channel of guild.channels.cache.values()) {
      try {
        if (channel.viewable && channel.permissionsFor(guild.me).has('MANAGE_ROLES')) {
          if (channel.type === 'text') { // Deny permissions in text channels
            await channel.updateOverwrite(muteRole, {
              'SEND_MESSAGES': false,
              'ADD_REACTIONS': false
            });
          } else if (channel.type === 'voice' && channel.editable) { // Deny permissions in voice channels
            await channel.updateOverwrite(muteRole, {
              'SPEAK': false,
              'STREAM': false
            });
          }
        }
      } catch (err) {
        this._client.logger.error(err.stack);
      }
    }

    return muteRole;
  }

  async _createCrownRole(guild) {

    // Create crown role
    let crownRole;
    try {
      crownRole = await guild.roles.create({
        data: {
          name: 'The Crown',
          permissions: [],
          hoist: true
        }
      });
    } catch (err) {
      this._client.logger.error(err.message);
    }

    return crownRole;
  }

  async run({ guild }) {

    const { Guild, GuildConfig } = this._models;

    // Create guild if it doesn't exist
    const [, created] = await Guild.findOrCreate({
      where: { id: guild.id },
      defaults: {
        id: guild.id,
        name: guild.name,
        ownerId: guild.ownerID
      }
    });

    let modLog, adminRole, modRole, muteRole, crownRole;

    if (created) {
      ({ modLog, adminRole, modRole, muteRole, crownRole } = await this._findRoles(guild));
    }

    // Create guild config if it doesn't exist
    const [config,] = await GuildConfig.findOrCreate({
      where: { id: guild.id },
      defaults: {
        id: guild.id,
        systemChannelId: guild.systemChannelID,
        welcomeChannelId: guild.systemChannelID,
        farewellChannelId: guild.systemChannelID,
        modLogChannelId: modLog ? modLog.id : null,
        adminRoleId: adminRole ? adminRole.id : null,
        modRoleId: modRole ? modRole.id : null,
        muteRoleId: muteRole ? muteRole.id : null,
        crownRoleId: crownRole ? crownRole.id : null
      }
    });

    // Save config in memory
    this._client.configs.set(guild.id, config);

    return created;
  }
}

module.exports = AddGuild;
