const Action = require('../Action.js');

class RemoveGuild extends Action {
  constructor(client) {
    super(client);
  }
  async run({ guild }) {
    const { Guild } = this._models;
    await Guild.destroy({ where: { id: guild.id }});

    // Delete config from memory
    this._client.configs.delete(guild.id);
  }
}

module.exports = RemoveGuild;
