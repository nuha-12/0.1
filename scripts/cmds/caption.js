const axios = require("axios");
const fs = require("fs");
const path = require("path");

const vipPath = path.join(__dirname, "cache", "vip.json");
const OWNER_UID = "61557991443492"; // Hasib UID

const getBaseApi = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "caption",
    version: "1.8",
    author: "MahMUD",
    countDown: 5,
    category: "love",
    description: "Get a caption from a category (VIP only)",
    guide: "{pn} <category> [language]\n{pn} list  Show available categories\n{pn} add <category> <language> <text>  Add new caption"
  },

  onStart: async function({ event, message, args }) {
    // --- VIP check (owner bypass) ---
    if (event.senderID !== OWNER_UID) {
      if (!fs.existsSync(vipPath)) fs.writeFileSync(vipPath, JSON.stringify([]));
      let vipData = [];
      try { vipData = JSON.parse(fs.readFileSync(vipPath)); } catch { vipData = []; }
      const now = Date.now();
      const isVIP = vipData.find(u => u.uid === event.senderID && u.expire > now);
      if (!isVIP) return message.reply("⚠️ This command is **VIP only**.\n⏰ Contact Hasib to get VIP access!");
    }

    const baseUrl = await getBaseApi();

    // --- List categories ---
    if (args[0] === "list") {
      try {
        const res = await axios.get(`${baseUrl}/api/caption/list`);
        const categories = res.data.categories.map(cat => `• ${cat}`).join("\n");
        return message.reply(`>🎀 𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐜𝐚𝐭𝐞𝐠𝐨𝐫𝐢𝐞𝐬:\n\n${categories}`);
      } catch {
        return message.reply("❌ Failed to fetch category list.");
      }
    }

    // --- Add new caption ---
    if (args[0] === "add") {
      if (args.length < 4) return message.reply("⚠ Please specify a category, language (bn/en), and caption text.");
      const category = args[1];
      const language = args[2];
      const caption = args.slice(3).join(" ");
      try {
        const res = await axios.post(`${baseUrl}/api/caption/add`, { category, language, caption });
        return message.reply(res.data.message || "✅ Caption added successfully!");
      } catch {
        return message.reply("❌ Failed to add caption. Make sure category and language are valid.");
      }
    }

    // --- Get caption ---
    if (!args[0]) return message.reply("⚠ Please specify a category. Example: !caption love");
    const category = args[0];
    const language = args[1] || "bn";

    try {
      const res = await axios.get(`${baseUrl}/api/caption`, { params: { category, language } });
      return message.reply(`✅ | Here’s your ${category} caption:\n\n${res.data.caption}`);
    } catch {
      return message.reply("❌ Failed to fetch caption. Please check the category and language.");
    }
  }
};
