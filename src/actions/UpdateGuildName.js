const Action = require('../Action.js');

class UpdateGuildName extends Action {
  constructor(client) {
    super(client);
  }
  async run({ oldGuild, newGuild }) {
    // Update guild name
    const { Guild } = this._client.db.models;
    const guild = await Guild.findOne({ where: { guildId: oldGuild.id }});
    guild.name = newGuild.name;
    await guild.save();
  }
}

module.exports = UpdateGuildName;
