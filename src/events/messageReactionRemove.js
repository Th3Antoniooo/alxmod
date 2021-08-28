/**
 * Message Reaction Remove Event
 */
module.exports = async (client, messageReaction, user) => {

  if (client.user === user) return;

  const { message, emoji } = messageReaction;

  // Starboard
  if (emoji.name === '⭐' && message.author != user) {
    await client.actions.UpdateStarboard.run({ message, amount: -1 });
  }
};
