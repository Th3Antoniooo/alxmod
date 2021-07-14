/**
 * Calypso's Action class
 * Actions are stored in the 'actions' property, which already has existing discord.js actions
 * Calypso's actions are fundamentally different than the library actions
 * This class is probably overkill and an overabstraction, but I like the pattern
 * @abstract
 */
class Action {

  /**
   * @property {string} _client - The client that the action belongs to
   * @property {Object} _models - All of the loaded data models
   */

  /**
   * Creates instance of Action
   * @constructor
   * @param {Client} client - The client that owns this action
   */
  constructor(client) {

    // Ensure this action is not an existing one
    if (this.constructor.name in client.actions) throw new Error('Action class name already exists');

    // Enforce abstract class
    if (this.constructor == Action) throw new Error('The Action abstract class cannot be instantiated');

    /**
     * Client that owns this action
     * @type {Client}
     * @private
     */
    this._client = client;

    /**
     * The data models
     * @type {Object}
     * @private
     */
    this._models = client.db.models;
  }

  /**
   * Runs the action
   * @param {Object} params - All parameters needed by the action
   * @throws {Error} Method must be implemented
   * @returns {undefined}
   * @abstract
   */
  // eslint-disable-next-line no-unused-vars
  run(params = {}) {
    throw new Error('The run() method must be implemented');
  }
}

module.exports = Action;
