/**
 * Guild Member Update Event
 */
module.exports = async (client, oldMember, newMember) => {

  if (oldMember.nickname != newMember.nickname) {
    // Update member nickname
    await client.actions.UpdateNickname.run({ oldMember, newMember });

    await client.botLogger.sendNicknameLog(oldMember, newMember);
  }

  // Role add
  if (oldMember.roles.cache.size < newMember.roles.cache.size) {
    await client.botLogger.sendRoleAddLog(oldMember, newMember);
  }

  // Role remove
  if (oldMember.roles.cache.size > newMember.roles.cache.size) {
    await client.botLogger.sendRoleRemoveLog(oldMember, newMember);
  }
};
