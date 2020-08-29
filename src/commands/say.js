const logger = require('@greencoast/logger');
const { splitToPlayable } = require('../common/utils');
const allowOver200 = process.env.ALLOW_OVER_200 || require('../../config/settings.json').allow_more_than_200_chars;
const default_voice_channel = process.env.DEFAULT_VOICE_CHANNEL || require('../../config/settings.json').default_voice_channel;

module.exports = {
  name: 'say',
  description: `Send a TTS message in your voice channel${allowOver200 ? '.' : ' (Up to 200 characters).'}`,
  emoji: ':speaking_head:',
  execute(message, options, client) {
    let { channel } = message.member.voice;
    const { ttsPlayer, name: guildName, voice } = message.guild;
    const connection = voice ? voice.connection : null;
    const [atLeastOneWord] = options.args;

    if (!channel && default_voice_channel) {
      channel = client.channels.cache.get(default_voice_channel);
    }

    if (!channel) {
      message.reply('you need to be in a voice channel first.');
      return;
    }

    if (!channel.joinable) {
      message.reply('I cannot join your voice channel.');
      return;
    }

    if (!atLeastOneWord) {
      message.reply('you need to specify a message.');
      return;
    }

    if (connection) {
      splitToPlayable(options.args)
        .then((phrases) => {
          ttsPlayer.say(phrases);
        })
        .catch((error) => {
          message.reply(error);
        });
    } else {
      channel.join()
        .then(() => {
          logger.info(`Joined ${channel.name} in ${guildName}.`);
          message.channel.send(`Joined ${channel}.`);
          splitToPlayable(options.args)
            .then((phrases) => {
              ttsPlayer.say(phrases);
            })
            .catch((error) => {
              message.reply(error);
            });
        })
        .catch((error) => {
          throw error;
        });
    }
  }
}
