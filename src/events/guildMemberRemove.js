/**
 * Guild Member Remove Event
 */
module.exports = async (client, member) => {
  if (member.user === client.user) return;
  client.logger.info(`${member.guild.name}: ${member.user.tag} has left the server`);

  const { RemoveMember, SendFarewellMessage } = client.actions;

  await RemoveMember.run({ userId: member.id, guildId: member.guild.id });

  await SendFarewellMessage.run({ member });

  await client.botLogger.sendMemberRemoveLog(member);
};
