/**
 * Guild Member Update Event
 */
module.exports = async (client, oldMember, newMember) => {

  if (oldMember.nickname != newMember.nickname) {
    // Update member nickname
    await client.actions.UpdateNickname.run({ oldMember, newMember });
  }
};
