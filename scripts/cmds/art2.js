const axios = require("axios");

module.exports = {
  config: {
    name: "art",
    role: 1, // VIP only
    author: "OtinXSandip",
    countDown: 5,
    longDescription: "Art images",
    category: "AI",
    guide: {
      en: "${pn} reply to an image with a prompt and choose model 1 - 52"
    }
  },

  onStart: async function ({ message, api, args, event, isOwner, isVIP }) {
    // Owner bypass VIP
    if (!isOwner && !isVIP) {
      return message.reply("❌ This command is VIP-only.");
    }

    const text = args.join(' ');

    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]) {
      return message.reply("❌ You must reply to an image.");
    }

    const imgurl = encodeURIComponent(event.messageReply.attachments[0].url);

    const [prompt, model] = text.split('|').map((t) => t.trim());
    const puti = model || "37";

    api.setMessageReaction("⏰", event.messageID, () => {}, true);

    const lado = `https://sandipapi.onrender.com/art?imgurl=${imgurl}&prompt=${encodeURIComponent(prompt)}&model=${puti}`;

    message.reply("✅ Generating, please wait...", async (err, info) => {
      const attachment = await global.utils.getStreamFromURL(lado);
      message.reply({ attachment });
      message.unsend(info.messageID);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
    });
  }
};
