const { Collection } = require('discord.js');

class ConfigCache extends Collection {
  constructor(iterable = null) {
    super(iterable);
  }

  update(guildId, field, value) {
    super.get(guildId)[field] = value;
  }
}

module.exports = ConfigCache;
