/**
 * Guild Member Add Event
 */
module.exports = async (client, member) => {
  client.logger.info(`${member.guild.name}: ${member.user.tag} has joined the server`);

  const { AddMember, SendWelcomeMessage } = client.actions;

  await AddMember.run({ member });

  await SendWelcomeMessage.run({ member });
};
