const { MessageEmbed } = require('discord.js');
const moment = require('moment');

/**
 * Calypso's BotLogger class<br>
 * <br>
 * All logs sent to discord channels by Calypso
 */
class BotLogger {

  /**
   * Creates instance of BotLogger
   * @constructor
   * @param {Client} client - The client that owns this bot logger
   */
  constructor(client) {
    this._client = client;
  }

  /**
	 * Sends member add log
	 * @param {Member} member - The member that has joined the server
	 * @returns {undefined}
	 */
  async sendMemberAddLog(member) {

    const { guild, user } = member;

    // Get member log
    const memberLogChannelId = this._client.configs.get(guild.id).memberLogChannelId;
    const memberLogChannel = guild.channels.cache.get(memberLogChannelId);
    if (this._client.isAllowed(memberLogChannel)) {
      const embed = new MessageEmbed()
        .setTitle('Member Joined')
        .setAuthor(`${guild.name}`, guild.iconURL({ dynamic: true }))
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(`${member} (**${user.tag}**)`)
        .addField('Account created on', moment(user.createdAt).format('dddd, MMMM Do YYYY'))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      await memberLogChannel.send(embed);
    }
  }

  /**
	 * Sends member remove log
	 * @param {Member} member - The member that has left the server
	 * @returns {undefined}
	 */
  async sendMemberRemoveLog(member) {

    const { guild, user } = member;

    // Get member log
    const memberLogChannelId = this._client.configs.get(guild.id).memberLogChannelId;
    const memberLogChannel = guild.channels.cache.get(memberLogChannelId);
    if (this._client.isAllowed(memberLogChannel)) {
      const embed = new MessageEmbed()
        .setTitle('Member Left')
        .setAuthor(`${guild.name}`, guild.iconURL({ dynamic: true }))
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setDescription(`${member} (**${user.tag}**)`)
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      await memberLogChannel.send(embed);
    }
  }

  /**
	 * Sends member nickname update log
	 * @param {Member} oldMember - The member's state before the update
	 * @param {Member} newMember - The member's state after the update
	 * @returns {undefined}
	 */
  async sendNicknameLog(oldMember, newMember) {

    const { guild, user } = oldMember;
    const none = '`None`';

    // Get nickname log
    const nicknameLogChannelId = this._client.configs.get(guild.id).nicknameLogChannelId;
    const nicknameLogChannel = guild.channels.cache.get(nicknameLogChannelId);
    if (this._client.isAllowed(nicknameLogChannel)) {
      const oldNickname = oldMember.nickname || none;
      const newNickname = newMember.nickname || none;
      const embed = new MessageEmbed()
        .setTitle('Member Update: `Nickname`')
        .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
        .setDescription(`${newMember}'s **nickname** was changed.`)
        .addField('Nickname', `${oldNickname} ➔ ${newNickname}`)
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      await nicknameLogChannel.send(embed);
    }
  }

  /**
	 * Sends member role add log
	 * @param {Member} oldMember - The member's state before the update
	 * @param {Member} newMember - The member's state after the update
	 * @returns {undefined}
	 */
  async sendRoleAddLog(oldMember, newMember) {

    const { guild, user } = oldMember;

    // Get member role update log
    const roleLogChannelId = this._client.configs.get(guild.id).roleLogChannelId;
    const roleLogChannel = guild.channels.cache.get(roleLogChannelId);
    if (this._client.isAllowed(roleLogChannel)) {
      const role = newMember.roles.cache.difference(oldMember.roles.cache).first();
      const embed = new MessageEmbed()
        .setTitle('Member Update: `Role Add`')
        .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
        .setDescription(`${newMember} was **given** the ${role} role.`)
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      await roleLogChannel.send(embed);
    }
  }

  /**
	 * Sends member role remove log
	 * @param {Member} oldMember - The member's state before the update
	 * @param {Member} newMember - The member's state after the update
	 * @returns {undefined}
	 */
  async sendRoleRemoveLog(oldMember, newMember) {

    const { guild, user } = oldMember;

    // Get member role update log
    const roleLogChannelId = this._client.configs.get(guild.id).roleLogChannelId;
    const roleLogChannel = guild.channels.cache.get(roleLogChannelId);
    if (this._client.isAllowed(roleLogChannel)) {
      const role = newMember.roles.cache.difference(oldMember.roles.cache).first();
      const embed = new MessageEmbed()
        .setTitle('Member Update: `Role Remove`')
        .setAuthor(`${user.tag}`, user.displayAvatarURL({ dynamic: true }))
        .setDescription(`${newMember} was **removed** from ${role} role.`)
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      await roleLogChannel.send(embed);
    }
  }

  /**
	 * Sends message edit log
	 * @param {Message} oldMessage - The message's state before the update
	 * @param {Message} newMessage - The message's state after the update
	 * @returns {undefined}
	 */
  async sendMessageEditLog(oldMessage, newMessage) {

    const { guild, member, author, channel, url } = newMessage;

    // Get message edit log
    const messageEditLogChannelId = this._client.configs.get(guild.id).messageEditLogChannelId;
    const messageEditLogChannel = guild.channels.cache.get(messageEditLogChannelId);
    if (this._client.isAllowed(messageEditLogChannel)) {

      if (newMessage.content.length > 1024) newMessage.content = newMessage.content.slice(0, 1021) + '...';
      if (oldMessage.content.length > 1024) oldMessage.content = oldMessage.content.slice(0, 1021) + '...';

      const embed = new MessageEmbed()
        .setTitle('Message Update: `Edit`')
        .setAuthor(`${author.tag}`, author.displayAvatarURL({ dynamic: true }))
        .setDescription(`
          ${member}'s **message** in ${channel} was edited. [Jump to message!](${url})
        `)
        .addField('Before', oldMessage.content)
        .addField('After', newMessage.content)
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      await messageEditLogChannel.send(embed);
    }
  }

  /**
	 * Sends message delete log
	 * @param {Message} message - The message that was deleted
	 * @returns {undefined}
	 */
  async sendMessageDeleteLog(message) {

    const { guild, member, author, channel } = message;
    let { content } = message;

    // Get message delete log
    const messageDeleteLogChannelId = this._client.configs.get(guild.id).messageDeleteLogChannelId;
    const messageDeleteLogChannel = guild.channels.cache.get(messageDeleteLogChannelId);
    if (this._client.isAllowed(messageDeleteLogChannel)) {

      const embed = new MessageEmbed()
        .setTitle('Message Update: `Delete`')
        .setAuthor(`${author.tag}`, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      // Normal message
      if (content) {
        if (content.length > 1024) content = content.slice(0, 1021) + '...';
        embed
          .setDescription(`${member}'s **message** in ${channel} was deleted.`)
          .addField('Message', content);
      // Embed only
      } else {
        embed.setDescription(`${member}'s **message embed** in ${channel} was deleted.`);
      }
      await messageDeleteLogChannel.send(embed);
    }
  }

  /**
	 * Sends message bulk delete log
	 * @param {Collection<Snowflake, Message>} messages - Collection of messages that were deleted
	 * @returns {undefined}
	 */
  async sendMessageBulkDeleteLog(messages) {

    const message = messages.first();
    const { guild, channel } = message;

    // Get message delete log
    const messageDeleteLogChannelId = this._client.configs.get(guild.id).messageDeleteLogChannelId;
    const messageDeleteLogChannel = guild.channels.cache.get(messageDeleteLogChannelId);
    if (this._client.isAllowed(messageDeleteLogChannel)) {
      const embed = new MessageEmbed()
        .setTitle('Message Update: `Bulk Delete`')
        .setAuthor(`${guild.name}`, guild.iconURL({ dynamic: true }))
        .setDescription(`**${messages.size} messages** in ${channel} were deleted.`)
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      await messageDeleteLogChannel.send(embed);
    }
  }

  /**
	 * Sends message embed delete log
	 * @param {Message} oldMessage - The message's state before the update
	 * @param {Message} newMessage - The message's state after the update
	 * @returns {undefined}
	 */
  async sendMessageEmbedDeleteLog(oldMessage, newMessage) {

    const { guild, member, author, channel } = newMessage;

    // Get message delete log
    const messageDeleteLogChannelId = this._client.configs.get(guild.id).messageDeleteLogChannelId;
    const messageDeleteLogChannel = guild.channels.cache.get(messageDeleteLogChannelId);
    if (this._client.isAllowed(messageDeleteLogChannel)) {

      if (newMessage.content.length > 1024) newMessage.content = newMessage.content.slice(0, 1021) + '...';
      if (oldMessage.content.length > 1024) oldMessage.content = oldMessage.content.slice(0, 1021) + '...';

      const embed = new MessageEmbed()
        .setTitle('Message Update: `Delete`')
        .setAuthor(`${author.tag}`, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      if (oldMessage.embeds.length > 1) {
        embed.setDescription(`${member}'s **message embeds** in ${channel} were deleted.`);
      } else {
        embed.setDescription(`${member}'s **message embed** in ${channel} was deleted.`);
      }
      await messageDeleteLogChannel.send(embed);
    }
  }

}

module.exports = BotLogger;
