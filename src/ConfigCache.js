const { Collection } = require('discord.js');

/**
 * Calypso's ConfigCache class
 * A normal Collection with a helper method to update fields
 * @extends Collection
 */
class ConfigCache extends Collection {

  /**
   * Creates instance of ConfigCache
   * @constructor
   * @param [iterable] - Array or iterable object
   */
  constructor(iterable = null) {
    super(iterable);
  }

  /**
   * Updates a cached GuildConfig field with the given value
   * @param {string} guildId - The ID of the guild to update
   * @param {string} field - The field of the GuildConfig to update
   * @param {string} value - The new value of the field
   * @returns {undefined}
   */
  update(guildId, field, value) {
    super.get(guildId)[field] = value;
  }
}

module.exports = ConfigCache;
