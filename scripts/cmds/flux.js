const axios = require("axios");
const { isVip } = require("./vip"); // ✅ Import VIP system

const OWNER_UID = "61557991443492"; // 👑 Owner UID

// ✅ Check if user can use command
function canUseCommand(uid) {
  if (uid === OWNER_UID) return true;
  return isVip(uid);
}

module.exports = {
  config: {
    name: "flux",
    version: "1.1.0",
    author: "Rasin & Hasib",
    countDown: 5,
    role: 0,
    description: {
      en: "Generate image using FLUX AI",
    },
    category: "FLUX",
    guide: {
      en: "{pn}flux [prompt]",
    },
  },

  onStart: async function ({ event, args, message, api }) {
    // 🔒 VIP + Owner check
    if (!canUseCommand(event.senderID)) {
      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID]?.name || "User";
      return message.reply(`❌ Sorry ${userName}, you are not allowed to use this command because you are not a VIP!`);
    }

    const rasinAPI = "https://rasin-x-apis.onrender.com/api/rasin/flux";

    try {
      const prompt = args.join(" ");
      if (!prompt) {
        return message.reply("⚠️ Please provide a prompt!");
      }

      const startTime = Date.now();
      const waitMessage = await message.reply("🎨 Generating image...");
      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const apiurl = `${rasinAPI}?prompt=${encodeURIComponent(prompt)}&apikey=rs_5or55iwr-h6no-z7d7-ifsd-o5`;
      const response = await axios.get(apiurl, { responseType: "stream" });

      const time = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      message.unsend(waitMessage.messageID);

      message.reply({
        body: `✅ Here's your generated image (${time}s)`,
        attachment: response.data,
      });
    } catch (e) {
      console.error("Flux Error:", e.response?.data || e);
      message.reply(`❌ Error: ${e.response?.data?.error || e.message || "Failed to generate image. Please try again later."}`);
    }
  }
};
