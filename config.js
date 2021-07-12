require('dotenv').config();

module.exports = {
  env: 'development',
  prefix: '!!',
  token: process.env.TOKEN,
  intents: [
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MEMBERS',
    'GUILD_PRESENCES',
    'GUILD_MESSAGE_REACTIONS'
  ],
  commandTypes: {
    INFO: 'info',
    FUN: 'fun',
    COLOR: 'color',
    POINTS: 'points',
    MISC: 'misc',
    MOD: 'mod',
    ADMIN: 'admin',
    OWNER: 'owner'
  },
  channelIds: {
    bugReportChannelId: process.env.BUG_REPORT_CHANNEL_ID,
    feedbackChannelId: process.env.FEEDBACK_CHANNEL_ID,
    serverLogChannelId: process.env.SERVER_LOG_CHANNEL_ID
  },
  apiKeys: {
    catApi: process.env.CAT_API_KEY,
    youtubeApi: process.env.YOUTUBE_API_KEY
  },
  ownerIds: process.env.OWNER_IDS.split(','),
  dbConfig: {
    development: {
      host: 'localhost',
      username: 'admin',
      password: 'admin',
      dialect: 'sqlite',
      storage: './data/db.sqlite',
      logging: true
    },
    production: {
      host: process.env.DB_HOST,
      username: process.env.DB_USERNAME,
      password: process.env_DB_PASSWORD,
      dialect: 'sqlite',
      storage: './data/db.sqlite',
      logging: false
    }
  }
};
