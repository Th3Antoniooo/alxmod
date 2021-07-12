const Action = require('../Action.js');

class RemoveMember extends Action {
  constructor(client) {
    super(client);
  }
  async run({ userId, guildId }) {
    const { User, GuildMember } = this._models;

    // Delete member
    await GuildMember.destroy({ where: { userId, guildId }});

    // Remove user from users table if no guild members exist
    const member = await GuildMember.findOne({ where: { userId }});
    if (!member) await User.destroy({ where: { id: userId }});
  }
}

module.exports = RemoveMember;
