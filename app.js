const config = require('./config.js');
const Client = require('./src/Client.js');
const { Intents } = require('discord.js');

global.__basedir = __dirname;

// Client setup
const intents = new Intents();
for (const intent of config.intents) {
  intents.add(intent);
}

const client = new Client(config, { ws: { intents: intents }});

// Initialize client
(async () => { await client.init(); })();

process.on('unhandledRejection', err => client.logger.error(err));
