const Command = require('../Command.js');
const { MessageEmbed, MessageCollector } = require('discord.js');
const fs = require('fs');
const YAML = require('yaml');
const { oneLine } = require('common-tags');

/**
 * Calypso's Trivia command
 * @extends Command
 */
class Trivia extends Command {

  /**
   * Creates instance of Trivia command
   * @constructor
   * @param {Client} client - Calypso's client
   * @param {Object} options - All command options
   */
  constructor(client) {
    super(client, {
      name: 'trivia',
      aliases: ['triv', 't'],
      usage: 'trivia [topic]',
      description: oneLine`
        Compete against your friends in a game of trivia (anyone can answer).
        If no topic is given, a random one will be chosen.
        The question will expire after 15 seconds.
      `,
      type: client.types.FUN,
      examples: ['trivia sports']
    });
  }

  /**
	 * Runs the command
	 * @param {Message} message - The message that ran the command
	 * @param {Array<string>} args - The arguments for the command
	 * @returns {undefined}
	 */
  run(message, args) {
    const { client, guild, channel, member, author } = message;

    const prefix = client.configs.get(guild.id).prefix; // Get prefix

    // Get topic
    let topic = args[0];
    if (!topic) { // Pick a random topic if none given
      topic = client.topics[Math.floor(Math.random() * client.topics.length)];

    // Invalid topic
    } else if (!client.topics.includes(topic)) {
      return this.sendErrorMessage(
        message, this.errorTypes.INVALID_ARG, `Please provide a valid topic, use ${prefix}topics for a list`
      );
    }

    // Get question and answers
    const path = __basedir + '/data/trivia/' + topic + '.yml';
    const questions = YAML.parse(fs.readFileSync(path, 'utf-8')).questions;
    const n = Math.floor(Math.random() * questions.length);
    const question = questions[n].question;
    const answers = questions[n].answers;
    const origAnswers = [...answers].map(a => `\`${a}\``);

    // Clean answers
    for (let i = 0; i < answers.length; i++) {
      answers[i] = answers[i].trim().toLowerCase().replace(/\.|'|-|\s/g, '');
    }

    // Create question embed
    const questionEmbed = new MessageEmbed()
      .setTitle('Trivia')
      .addField('Topic', `\`${topic}\``)
      .addField('Question', `${question}`)
      .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
      .setTimestamp()
      .setColor(guild.me.displayHexColor);

    // Check for image
    const url = question.match(/\bhttps?:\/\/\S+/gi);
    if (url) questionEmbed.setImage(url[0]);

    // Send question
    channel.send(questionEmbed);

    // Create collector
    let winner;
    const collector = new MessageCollector(channel, msg => {
      if (!msg.author.bot && msg.author == author) return true;
    }, { time: 15000 }); // Wait 15 seconds

    // On collect
    collector.on('collect', msg => {
      if (answers.includes(msg.content.trim().toLowerCase().replace(/\.|'|-|\s/g, ''))) {
        winner = msg.author;
        collector.stop();
      }
    });

    // On end
    collector.on('end', () => {
      const answerEmbed = new MessageEmbed()
        .setTitle('Trivia')
        .setFooter(member.displayName, author.displayAvatarURL({ dynamic: true }))
        .setTimestamp()
        .setColor(guild.me.displayHexColor);
      if (winner) channel.send(answerEmbed.setDescription(`Congratulations ${winner}, you gave the correct answer!`));
      else {
        channel.send(answerEmbed
          .setDescription('Sorry, time\'s up! Better luck next time.')
          .addField('Correct Answers', origAnswers.join('\n'))
        );
      }
    });
  }
}

module.exports = Trivia;
