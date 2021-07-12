/**
 * User Update Event
 */
module.exports = async (client, oldUser, newUser) => {
  if (oldUser.username != newUser.username || oldUser.discriminator != newUser.discriminator) {

    await client.actions.UpdateUsername.run({ oldUser, newUser });

    client.logger.info(`${oldUser.tag} user tag changed to ${newUser.tag}`);
  }
};
