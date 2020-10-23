const logger = require('@greencoast/logger');
const { splitToPlayable } = require('../common/utils');
const allowOver200 = process.env.ALLOW_OVER_200 || require('../../config/settings.json').allow_more_than_200_chars;
const default_voice_channel = process.env.DEFAULT_VOICE_CHANNEL || require('../../config/settings.json').default_voice_channel;
const prefix = process.env.PREFIX || require('../../config/settings.json').prefix;
let listening = false;

module.exports = {
  name: 'start',
  description: `Start`,
  emoji: ':speaking_head:',
  listening: listening,
  stop() {
    listening = false;
  },
  execute(message, options, client) {
    let { channel } = message.member.voice;
    const { ttsPlayer, name: guildName, voice } = message.guild;
    const connection = voice ? voice.connection : null;
    const [atLeastOneWord] = options.args;

    if (!(message.author.username === 'Al Mlichaels')) {
      message.reply("you're no Al Mlichaels");
      return;
    }

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

    if (listening) {
      return;
    }

    listening = true;
    let filter = newMsg => newMsg.author.id === message.author.id && newMsg.channel.id === message.channel.id && newMsg.content;
    let collector = message.channel.createMessageCollector(filter);
    collector.on('collect', async newMsg => {
        if(newMsg.content === `${prefix}end`) {
            collector.stop();
        }

        if (voice && voice.connection) {
            try {
                let phrases = await splitToPlayable(newMsg.content.split(" "));
                ttsPlayer.say(phrases);
            } catch (error) {
                console.log(error);
                message.reply(error);
            }
        }
    });

    collector.on('end', async () => {
        try {
            let vc = message.member.voice.channel || client.voice.connections.find(connection => connection.channel.guild.id === user.guild).channel;
            vc.leave();
        } catch(e) {
            console.log(e);
        }
        return message.channel.send("Ended");
    });


    if (!connection) {
      channel.join().then(() => {
          logger.info(`Joined ${channel.name} in ${guildName}.`);
          message.channel.send(`Joined ${channel}.`);
         })
     }
}
}
