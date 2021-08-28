const Action = require('../Action.js');

class UpdateModOnlyChannels extends Action {
  constructor(client) {
    super(client);
  }
  async run({ guildId, channels }) {
    const { ModOnlyChannel } = this._models;

    // Update config
    this._client.configs.update(guildId, 'modOnlyChannels', channels);

    // Update db
    channels = channels.map(channel => {
      return { id: channel.id, guildId, name: channel.name };
    });

    await ModOnlyChannel.destroy({ where: { guildId }}); // Remove old channels
    await ModOnlyChannel.bulkCreate(channels);
  }
}

module.exports = UpdateModOnlyChannels;
