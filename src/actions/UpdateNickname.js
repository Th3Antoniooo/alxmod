const Action = require('../Action.js');

class UpdateNickname extends Action {
  constructor(client) {
    super(client);
  }
  async run({ oldMember, newMember }) {
    // Update username and discriminator
    const { GuildMember } = this._models;
    const member = await GuildMember.findOne({ where: { id: oldMember.id }});
    member.displayName = newMember.nickname;
    await member.save();
  }
}

module.exports = UpdateNickname;
