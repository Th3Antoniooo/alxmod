const { MessageEmbed } = require('discord.js');

/**
 * Calypso's ReactionMenu class
 */
class ReactionMenu {

  /**
   * @property {Client} _client - The client that the reaction menu belongs to
   * @property {TextChannel} _channel - The text channel that the reaction menu belongs to
   * @property {string} _memberId - The ID of the member who created the reaction menu
   * @property {MessageEmbed} embed - The embed used for the reaction menu
   * @property {Object} _json - The embed converted to JSON
   * @property {Array} arr - Array to be iterated over in windows
   * @property {number} interval - The iteration window size
   * @property {number} _current - Current index of the window start
   * @property {number} max - The max size of the array
   * @property {Object} reactions - Reaction emojis mapped to functions
   * @property {Array<string>} _emojis - The ID of each emoji used
   * @property {number} _timeout - How long the reaction menu will exist, in milliseconds
   * @property {Message} message - The message containing the reaction menu
   */

  /**
   * Creates instance of ReactionMenu
   * @constructor
   * @param {Client} client - The client that owns this reaction menu
   * @param {Object} options - All of the possible options for the reaction menu
   */
  constructor(client, options) {

    /**
     * Client that owns this reaction menu
     * @type {Client}
     * @private
     */
    this._client = client;

    /**
     * The text channel the reaction menu belongs to
     * @type {TextChannel}
     * @private
     */
    this._channel = options.channel;

    /**
     * The member ID snowflake
     * @type {string}
     * @private
     */
    this._memberId = options.member.id;

    /**
     * The embed passed to the reaction menu
     * @type {MessageEmbed}
     */
    this.embed = options.embed;

    /**
     * JSON from the embed
     * @type {Object}
     * @private
     */
    this._json = this.embed.toJSON();

    /**
     * The array to be iterated over
     * @type {Array}
     */
    this.arr = options.arr || null;

    /**
     * Size of each array window
     * @type {number}
     */
    this.interval = options.interval || 10;

    /**
     * The current array window start
     * @type {number}
     * @private
     */
    this._current = 0;

    /**
     * Max length of the array
     * @type {number}
     */
    this.max = (this.arr) ? this.arr.length : null;

    /**
     * Reactions for menu, mapped to functions
     * @type {Object}
     */
    this._reactions = options.reactions || {
      '⏪': this.first.bind(this),
      '◀️': this.previous.bind(this),
      '▶️': this.next.bind(this),
      '⏩': this.last.bind(this),
      '⏹️': this.stop.bind(this)
    };

    /**
     * The emojis used as keys
     * @type {Array<string>}
     * @private
     */
    this._emojis = Object.keys(this._reactions);

    /**
     * The collector timeout
     * @type {number}
     * @private
     */
    this._timeout = options.timeout || 120000;

    const first = new MessageEmbed(this._json);
    const description = (this.arr) ? this.arr.slice(this._current, this.interval) : null;
    if (description) {
      first
        .setTitle(this.embed.title + ' ' + this._client.utils.getRange(this.arr, this._current, this.interval))
        .setDescription(description);
    }

    this._channel.send(first).then(message => {

      /**
       * The menu message
       * @type {Message}
     */
      this.message = message;

      this._addReactions();
      this._createCollector();
    });
  }

  /**
   * Adds reactions to the message
   * @returns {undefined}
   */
  async _addReactions() {
    const { _emojis, message } = this;
    for (const emoji of _emojis) {
      await message.react(emoji);
    }
  }

  /**
   * Creates a reaction collector
   * @returns {undefined}
   */
  _createCollector() {

    // Create collector
    let { _memberId, _reactions, _emojis, _timeout, message } = this;
    const collector = message.createReactionCollector((reaction, user) => {
      return (_emojis.includes(reaction.emoji.name) || _emojis.includes(reaction.emoji.id)) &&
        user.id == _memberId;
    }, { time: _timeout });

    // On collect
    collector.on('collect', async reaction => {
      let newPage = _reactions[reaction.emoji.name] || _reactions[reaction.emoji.id];
      if (typeof newPage === 'function') newPage = newPage();
      if (newPage) await message.edit(newPage);
      await reaction.users.remove(_memberId);
    });

    // On end
    collector.on('end', () => {
      message.reactions.removeAll();
    });

    this.collector = collector;
  }

  /**
   * Skips to the first array interval
   * @returns {undefined}
   */
  first() {
    let { _client, embed, _json, arr, interval } = this;
    if (this._current === 0) return;
    this._current = 0;
    return new MessageEmbed(_json)
      .setTitle(embed.title + ' ' + _client.utils.getRange(arr, this._current, interval))
      .setDescription(arr.slice(this._current, this._current + interval));
  }

  /**
   * Goes back an array interval
   * @returns {undefined}
   */
  previous() {
    let { _client, embed, _json, arr, interval } = this;
    if (this._current === 0) return;
    this._current -= interval;
    if (this._current < 0) this._current = 0;
    return new MessageEmbed(_json)
      .setTitle(embed.title + ' ' + _client.utils.getRange(arr, this._current, interval))
      .setDescription(arr.slice(this._current, this._current + interval));
  }

  /**
   * Goes to the next array interval
   * @returns {undefined}
   */
  next() {
    let { _client, embed, _json, arr, interval, max } = this;
    const cap = max - (max % interval);
    if (this._current === cap || this._current + interval === max) return;
    this._current += interval;
    if (this._current >= max) this._current = cap;
    max = (this._current + interval >= max) ? max : this._current + interval;
    return new MessageEmbed(_json)
      .setTitle(embed.title + ' ' + _client.utils.getRange(arr, this._current, interval))
      .setDescription(arr.slice(this._current, max));
  }

  /**
   * Goes to the last array interval
   * @returns {undefined}
   */
  last() {
    let { _client, embed, _json, arr, interval, max } = this;
    const cap = max - (max % interval);
    if (this._current === cap || this._current + interval === max) return;
    this._current = cap;
    if (this._current === max) this._current -= interval;
    return new MessageEmbed(_json)
      .setTitle(embed.title + ' ' + _client.utils.getRange(arr, this._current, interval))
      .setDescription(arr.slice(this._current, max));
  }

  /**
   * Stops the collector
   * @returns {undefined}
   */
  stop() {
    this.collector.stop();
  }
}

module.exports = ReactionMenu;
