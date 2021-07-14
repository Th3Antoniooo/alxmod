const Action = require('../Action.js');
const { MessageEmbed } = require('discord.js');

class SendWelcomeMessage extends Action {
  constructor(client) {
    super(client);
  }
  async run({ member }) {
    const { guild, user } = member;
    const welcomeChannelId = this._client.configs.get(guild.id).welcomeChannelId;
    const welcomeChannel = guild.channels.cache.get(welcomeChannelId);
    if (!welcomeChannel) return;

    // Send welcome message
    if (this._client.isAllowed(welcomeChannel)) {
      let welcomeMessage = this._client.configs.get(guild.id).welcomeMessage;
      if (!welcomeMessage) return;
      welcomeMessage = welcomeMessage
        .replace(/`?\?member`?/g, member) // Member mention substitution
        .replace(/`?\?username`?/g, user.username) // Username substitution
        .replace(/`?\?tag`?/g, user.tag) // Tag substitution
        .replace(/`?\?size`?/g, guild.members.cache.size); // Guild size substitution
      await welcomeChannel.send(
        new MessageEmbed()
          .setDescription(welcomeMessage)
          .setColor(guild.me.displayHexColor)
      );
    }
  }
}

module.exports = SendWelcomeMessage;
