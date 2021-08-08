const { verify } = require('../utils/emojis.json');
const { stripIndent } = require('common-tags');

module.exports = async (client, messageReaction, user) => {

  if (client.user === user) return;

  const { message, emoji } = messageReaction;

  // Verification
  if (emoji.id === verify.split(':')[2].slice(0, -1)) {
    const { verification_role_id: verificationRoleId, verification_message_id: verificationMessageId } =
      client.db.settings.selectVerification.get(message.guild.id);
    const verificationRole = message.guild.roles.cache.get(verificationRoleId);

    if (!verificationRole || message.id != verificationMessageId) return;

    const member = message.guild.members.cache.get(user.id);
    if (!member.roles.cache.has(verificationRole)) {
      try {
        await member.roles.add(verificationRole);
      } catch (err) {
        return client.sendSystemErrorMessage(member.guild, 'verification',
          stripIndent`Unable to assign verification role,` +
          'please check the role hierarchy and ensure I have the Manage Roles permission'
          , err.message);
      }
    }
  }

  // Starboard
  if (emoji.name === '⭐' && message.author != user) {
    await client.actions.UpdateStarboard.run({ message, amount: 1 });
  }
};
