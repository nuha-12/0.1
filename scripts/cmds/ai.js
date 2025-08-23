const axios = require('axios');

module.exports = {
  config: {
    name: 'ai',
    aliases: ['ai , Ai'],
    prefix: false,
    author: 'Rasin',
    countDown: 2,
    role: 0,
    description: '( x )',
    category: 'ai'
  },

  onStart: async function ({ message, args, event }) {
    try {
      if (event.type === "message_reply" && event.messageReply.attachments?.[0]?.type === "photo") {
        const imgUrl = event.messageReply.attachments[0].url;
        const waiting = await message.reply(" | " + formatFont("Rasin AI recognitioning image, please wait..."));
        const apiUrl = `https://rasin-x-apis-main.onrender.com/api/rasin/image?message=describe+this+image&url=${encodeURIComponent(imgUrl)}`;
        const res = await axios.get(apiUrl);
        message.unsend(waiting.messageID);
        return message.reply({ body: " | \n\n" + formatFont(`${res.data.reply}`), attachment: await global.utils.getStreamFromURL(imgUrl) }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }

      const msg = args.join(" ");
      if (!msg) return message.reply('Ask me anything');

      const thinking = await message.reply("️ | " + formatFont("Rasin AI is thinking..."));
      const url = `https://rasin-x-apis-main.onrender.com/api/ai/rasin?message=${encodeURIComponent(msg)}&uid=${event.senderID}`;
      const response = await axios.get(url);
      const data = response.data;
      message.unsend(thinking.messageID);

      if (data.generatedImage) {
        return message.reply({ body: formatFont(`${data.message}`), attachment: await global.utils.getStreamFromURL(data.generatedImage) }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      } else {
        return message.reply(" \n\n" + formatFont(`${data.reply}`), (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }
    } catch (err) {
      console.error(err);
      message.reply("server error, try again later!");
    }
  },

  onReply: async function ({ message, event, Reply }) {
    try {
      if (event.attachments?.[0]?.type === "photo") {
        const imgUrl = event.attachments[0].url;
        const waiting = await message.reply(" | " + formatFont("Rasin AI recognitioning image, please wait..."));
        const apiUrl = `https://rasin-x-apis-main.onrender.com/api/rasin/image?message=describe+this+image&url=${encodeURIComponent(imgUrl)}`;
        const res = await axios.get(apiUrl);
        message.unsend(waiting.messageID);
        return message.reply({ body: " | \n\n" + formatFont(`${res.data.reply}`), attachment: await global.utils.getStreamFromURL(imgUrl) }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }

      const msg = event.body;
      const thinking = await message.reply("️ | " + formatFont("Rasin AI is thinking..."));
      const url = `https://rasin-x-apis-main.onrender.com/api/ai/rasin?message=${encodeURIComponent(msg)}&uid=${Reply?.uid || event.senderID}`;
      const response = await axios.get(url);
      const data = response.data;
      message.unsend(thinking.messageID);

      if (data.generatedImage) {
        return message.reply({ body: formatFont(`${data.message}`), attachment: await global.utils.getStreamFromURL(data.generatedImage) }, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      } else {
        return message.reply(" \n\n" + formatFont(`${data.reply}`), (err, info) => {
          global.GoatBot.onReply.set(info.messageID, { commandName: this.config.name });
        });
      }
    } catch (err) {
      console.error(err);
      message.reply("Error ");
    }
  }
};

function formatFont(text) {
  const fontMapping = {
    a: "", b: "", c: "", d: "", e: "", f: "", g: "", h: "", i: "", j: "", k: "", l: "", m: "", n: "", o: "", p: "", q: "", r: "", s: "", t: "", u: "", v: "", w: "", x: "", y: "", z: "",
    A: "", B: "", C: "", D: "", E: "", F: "", G: "", H: "", I: "", J: "", K: "", L: "", M: "", N: "", O: "", P: "", Q: "", R: "", S: "", T: "", U: "", V: "", W: "", X: "", Y: "", Z: ""
  };
  let formattedText = "";
  for (const char of text) {
    formattedText += fontMapping[char] || char;
  }
  return formattedText;
}
