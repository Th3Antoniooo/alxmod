/**
 * Calypso's Action class
 */
class Action {

  /**
   * Create new action
   * @param {Client} client
   */
  constructor(client) {

    if (this.constructor.name in client.actions) throw new Error('Action class name already exists');

    if (this.constructor == Action) throw new Error('The Action abstract class cannot be instantiated');

    /**
     * The client
     * @type {Client}
     */
    this._client = client;

    this._models = client.db.models;
  }

  /**
   * Runs the action
   * @param {Object} params
   */
  // eslint-disable-next-line no-unused-vars
  run(params = {}) {
    throw new Error('Action has no run() method');
  }
}

module.exports = Action;
