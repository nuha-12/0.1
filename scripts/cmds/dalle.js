const axios = require("axios");
const { createReadStream, unlinkSync } = require("fs");
const { writeFile } = require("fs/promises");
const path = require("path");
const { isVip } = require("./vip"); // ✅ VIP system

const OWNER_UID = "61557991443492"; // 👑 Owner UID

// ✅ Helper: Allow if Owner OR VIP
function canUseCommand(uid) {
  if (uid === OWNER_UID) return true;
  return isVip(uid);
}

module.exports = {
  config: {
    name: "dalle",
    aliases: ["imagine"],
    version: "1.3.0",
    author: "Rasin",
    countDown: 10,
    role: 0, // Role handled manually
    description: {
      en: "Generate image using DALL·E 3",
    },
    category: "Image Generation",
    guide: {
      en: "{pn} [prompt]",
    },
  },

  onStart: async function ({ event, args, message, api }) {
    // 🔒 VIP + Owner check
    if (!canUseCommand(event.senderID)) {
      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID]?.name || "User";
      return message.reply(`❌ Sorry ${userName}, you are not allowed to use this command because you are not a VIP!`);
    }

    const rasinAPI = "https://rasin-x-apis.onrender.com/api/rasin/dalle";
    const prompt = args.join(" ");

    if (!prompt) return message.reply("⚠️ Please provide a prompt!");

    try {
      const startTime = Date.now();
      const waitMessage = await message.reply("🎨 Generating image...");
      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      const apiUrl = `${rasinAPI}?prompt=${encodeURIComponent(prompt)}&apikey=rs_5or55iwr-h6no-z7d7-ifsd-o5`;
      const res = await axios.get(apiUrl);

      const dalleImages = res.data?.dalle;
      if (!dalleImages || dalleImages.length === 0) {
        return message.reply("❌ No images returned!");
      }

      const imageBuffers = [];

      for (let i = 0; i < dalleImages.length; i++) {
        const imgRes = await axios.get(dalleImages[i].url, { responseType: "arraybuffer" });
        const buffer = Buffer.from(imgRes.data, "binary");

        // Save temp file
        const filePath = path.join(__dirname, `temp_dalle_${Date.now()}_${i}.png`);
        await writeFile(filePath, buffer);
        imageBuffers.push(createReadStream(filePath));

        // Auto-delete after 15s
        setTimeout(() => {
          try { unlinkSync(filePath); } catch {}
        }, 15000);
      }

      const time = ((Date.now() - startTime) / 1000).toFixed(2);
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      message.unsend(waitMessage.messageID);

      message.reply({
        body: `✅ Here are your generated images (${time}s)`,
        attachment: imageBuffers
      });

    } catch (e) {
      console.error("DALL·E error:", e.response?.data || e);
      message.reply(`❌ Error: ${e.response?.data?.error || e.message || "Something went wrong!"}`);
    }
  }
};
