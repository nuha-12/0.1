const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/cache/vip.json";

const OWNER_UID = "61557991443492"; // Owner UID only

module.exports = {
  config: {
    name: "flux",
    version: "1.3.0",
    author: "Rasin",
    countDown: 5,
    role: 0,
    description: {
      en: "Flux (VIP only)"
    },
    category: "FLUX",
    guide: {
      en: "{pn}flux [prompt] (VIP only)"
    },
  },

  onStart: async function ({ event, args, message, api, usersData }) {
    // Load VIP data
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
    const data = JSON.parse(fs.readFileSync(path));

    // Check VIP or owner
    const isVIP = data.find(u => u.uid === event.senderID);
    if (event.senderID !== OWNER_UID && !isVIP) {
      return message.reply(
        "⚠️ You are not a VIP! Only VIP users or the owner can use this command.\n" +
        "💡 To become a VIP, contact the owner."
      );
    }

    // Determine prompt
    let prompt = args.join(" ");
    if (event.messageReply) {
      // If replying, use replied message as prompt
      const replyMessage = await api.getMessage(event.messageReply.messageID);
      prompt = replyMessage.body || prompt;
    }

    if (!prompt) return message.reply("⚠️ Please provide a prompt!");

    const rasinAPI = "https://rasin-x-apis.onrender.com/api/rasin/flux";
    const apiKey = "rs_5or55iwr-h6no-z7d7-ifsd-o5";

    try {
      const startTime = Date.now();
      const waitMessage = await message.reply("⏳ Generating image...");
      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const apiUrl = `${rasinAPI}?prompt=${encodeURIComponent(prompt)}&apikey=${apiKey}`;
      const response = await axios.get(apiUrl, { responseType: "stream" });

      const time = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      message.unsend(waitMessage.messageID);

      message.reply({
        body: `✅ Here's your generated image\n⏰ Generated in ${time}s`,
        attachment: response.data,
      });
    } catch (e) {
      console.error(e);
      message.reply(`❌ Error: ${e.message || "Failed to generate image. Please try again later."}`);
    }
  }
};
