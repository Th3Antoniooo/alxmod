/**
 * Message Delete Bulk Event
 */
module.exports = async (client, messages) => {

  await client.botLogger.sendMessageBulkDeleteLog(messages);
};
