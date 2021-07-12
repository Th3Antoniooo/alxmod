const Action = require('../Action.js');

class UpdateUsername extends Action {
  constructor(client) {
    super(client);
  }
  async run({ oldUser, newUser }) {
    // Update username and discriminator
    const { User } = this._models;
    const user = await User.findOne({ where: { id: oldUser.id }});
    user.username = newUser.username;
    user.discriminator = newUser.discriminator;
    await user.save();
  }
}

module.exports = UpdateUsername;
