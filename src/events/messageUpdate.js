/**
 * Message Update Event
 */
module.exports = (client, oldMessage, newMessage) => {

  // Detect edited commands
  if (
    newMessage.member &&
    newMessage.id === newMessage.member.lastMessageID &&
    !oldMessage.command
  ) {
    client.emit('message', newMessage);
  }
};
