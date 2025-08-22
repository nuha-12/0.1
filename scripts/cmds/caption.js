const axios = require("axios");
const fs = require("fs");
const path = require("path");

const vipPath = path.join(__dirname, "cache", "vip.json");
const OWNER_UID = "61557991443492"; // Hasib UID (owner bypass)

const baseApiUrl = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "caption",
    version: "1.8",
    author: "Hasib",
    countDown: 5,
    category: "love",
    guide: "Use !caption <category> [language] or !caption list/add"
  },

  onStart: async ({ message, args, event }) => {
    // --- VIP CHECK ---
    if (event.senderID !== OWNER_UID) { // Owner bypass
      if (!fs.existsSync(vipPath)) fs.writeFileSync(vipPath, JSON.stringify([]));
      let vipData = [];
      try {
        vipData = JSON.parse(fs.readFileSync(vipPath));
      } catch {
        vipData = [];
      }

      const now = Date.now();
      const userVIP = vipData.find(u => u.uid === event.senderID && u.expire > now);

      if (!userVIP) {
        return message.reply("⚠️ | Sorry, this command is **VIP only**.\n⏰ Contact Hasib to get VIP access!");
      }
    }

    // --- FETCH API BASE URL ---
    const baseUrl = await baseApiUrl();

    // --- LIST CATEGORIES ---
    if (args[0] === "list") {
      try {
        const res = await axios.get(`${baseUrl}/api/caption/list`);
        const categories = res.data.categories.map(cat => `• ${cat}`).join("\n");
        return message.reply(`>🎀 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬:\n\n${categories}`);
      } catch {
        return message.reply("❌ Failed to fetch category list.");
      }
    }

    // --- ADD CAPTION ---
    if (args[0] === "add") {
      if (args.length < 4) return message.reply("⚠ Please specify a category, language (bn/en), and caption text.");
      const category = args[1];
      const language = args[2];
      const caption = args.slice(3).join(" ");
      try {
        const res = await axios.post(`${baseUrl}/api/caption/add`, { category, language, caption });
        return message.reply(res.data.message);
      } catch {
        return message.reply("❌ Failed to add caption. Make sure category and language are valid.");
      }
    }

    // --- FETCH CAPTION ---
    if (!args[0]) return message.reply("⚠ Please specify a category. Example: !caption love");

    const category = args[0];
    const language = args[1] || "bn";

    try {
      const res = await axios.get(`${baseUrl}/api/caption`, { params: { category, language } });
      return message.reply(`✅| Here’s your ${category} caption:\n\n${res.data.caption}`);
    } catch {
      return message.reply("❌ Failed to fetch caption. Please check the category and language.");
    }
  }
};
