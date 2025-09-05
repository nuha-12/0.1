const axios = require("axios");
const fs = require("fs");
const path = __dirname + "/cache/vip.json";

const OWNER_UID = "61557991443492"; // Hasib can always use
const API_URL = "https://rasin-x-apis.onrender.com/api/rasin/flux";
const API_KEY = "rs_5or55iwr-h6no-z7d7-ifsd-o5";

module.exports = {
  config: {
    name: "flux",
    version: "1.1.0",
    author: "Rasin + Hasib",
    countDown: 5,
    role: 0,
    description: {
      en: "Flux image generator (VIP only, owner bypass)"
    },
    category: "FLUX",
    guide: {
      en: "{pn}flux [prompt]"
    }
  },

  onStart: async function ({ event, args, message, api, usersData }) {
    try {
      // --- Load VIP data ---
      if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([], null, 2));
      let data = JSON.parse(fs.readFileSync(path));
      const now = Date.now();

      // --- Owner bypass ---
      if (event.senderID !== OWNER_UID) {
        // Remove expired VIPs
        data = data.filter(u => u.expire > now);
        fs.writeFileSync(path, JSON.stringify(data, null, 2));

        // Check VIP
        const isVIP = data.some(u => u.uid === event.senderID);
        if (!isVIP) {
          return message.reply(
            "⚠️ | Sorry, this command is for VIP users only.\n\n💡 Ask the owner to add you as VIP."
          );
        }
      }

      // --- Prompt check ---
      const prompt = args.join(" ");
      if (!prompt) return message.reply("❌ | Please provide a prompt!");

      // --- Start ---
      const startTime = Date.now();
      const waitMsg = await message.reply(`⏳ Generating image for prompt:\n\n"${prompt}"`);

      try {
        await api.setMessageReaction("⌛", event.messageID, () => {}, true);
      } catch {}

      // --- API request ---
      const url = `${API_URL}?prompt=${encodeURIComponent(prompt)}&apikey=${API_KEY}`;
      const response = await axios.get(url, { responseType: "stream" });

      // --- Ensure it's an image ---
      if (!response.headers["content-type"]?.startsWith("image")) {
        throw new Error("API did not return an image.");
      }

      // --- Done ---
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
      try {
        await api.setMessageReaction("✅", event.messageID, () => {}, true);
      } catch {}
      await message.unsend(waitMsg.messageID);

      message.reply({
        body: `✅ Image generated in ${elapsed}s`,
        attachment: response.data
      });
    } catch (e) {
      console.error(e);
      message.reply(
        `❌ Error: ${e.message || "Failed to generate image. Please try again later."}`
      );
    }
  }
};
