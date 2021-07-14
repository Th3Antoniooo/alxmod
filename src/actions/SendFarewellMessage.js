const Action = require('../Action.js');
const { MessageEmbed } = require('discord.js');

class SendFarewellMessage extends Action {
  constructor(client) {
    super(client);
  }
  async run({ member }) {
    const { guild, user } = member;
    const farewellChannelId = this._client.configs.get(guild.id).farewellChannelId;
    const farewellChannel = guild.channels.cache.get(farewellChannelId);
    if (!farewellChannel) return;

    // Send farewell message
    if (this._client.isAllowed(farewellChannel)) {
      let farewellMessage = this._client.configs.get(guild.id).farewellMessage;
      if (!farewellMessage) return;
      farewellMessage = farewellMessage
        .replace(/`?\?member`?/g, member) // Member mention substitution
        .replace(/`?\?username`?/g, user.username) // Username substitution
        .replace(/`?\?tag`?/g, user.tag) // Tag substitution
        .replace(/`?\?size`?/g, guild.members.cache.size); // Guild size substitution
      await farewellChannel.send(
        new MessageEmbed()
          .setDescription(farewellMessage)
          .setColor(guild.me.displayHexColor)
      );
    }
  }
}

module.exports = SendFarewellMessage;
