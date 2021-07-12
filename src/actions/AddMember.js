const Action = require('../Action.js');
const { oneLine } = require('common-tags');

class AddMember extends Action {
  constructor(client) {
    super(client);
  }

  async _assignAutoRole(guild, member) {
    const { MISSING_ROLE, ROLE_UPDATE } = this._client.errorTypes;

    // Get auto role
    const autoRoleId = this._client.configs.get(guild.id).autoRoleId;
    const autoRole = guild.roles.cache.get(autoRoleId);
    let errorType, errorMessage;
    if (autoRoleId && !autoRole) {
      errorType = MISSING_ROLE;
      errorMessage = 'Unable to assign auto role, the role may have been deleted';
    } else {
      errorType = ROLE_UPDATE;
      errorMessage =
      'Unable to assign auto role, please check the role hierarchy and ensure I have the Manage Roles permission';
    }
    if (autoRole && !member.roles.cache.has(autoRoleId)) {
      try {
        await member.roles.add(autoRole);
      } catch (err) {
        this._client.sendSystemErrorMessage(guild, 'auto role', errorType, errorMessage);
      }
    }
  }

  async _assignRandomColor(guild, member) {
    // Assign random color
    const randomColor = this._client.configs.get(guild.id).randomColor;
    if (randomColor) {
      const colors = guild.roles.cache.filter(c => c.name.startsWith('#')).array();

      // Check length
      if (colors.length > 0) {
        const color = colors[Math.floor(Math.random() * colors.length)]; // Get color
        try {
          await member.roles.add(color);
        } catch (err) {
          this._client.sendSystemErrorMessage(
            guild,
            'random color',
            this._client.errorTypes.ROLE_UPDATE,
            oneLine`
              Unable to assign random color,
              please check the role hierarchy and ensure I have the Manage Roles permission
            `,
            err.message);
        }
      }
    }
  }

  async run({ member }) {
    const { User, GuildMember } = this._models;
    const { guild, user } = member;

    await this._assignAutoRole(guild, member);

    await this._assignRandomColor(guild, member);

    // Create user if not exists
    await User.findOrCreate({
      where: { id: member.id },
      defaults: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        bot: user.bot ? 1 : 0
      }
    });

    // Create guild member
    await GuildMember.create({
      userId: member.id,
      guildId: guild.id,
      displayName: member.displayName,
      joinedAt: member.joinedAt.toString()
    });
  }
}

module.exports = AddMember;
