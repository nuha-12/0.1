const axios = require("axios");
const fs = require("fs");
const path = require("path");

const vipPath = path.join(__dirname, "cache", "vip.json");

const mahmud = async () => {
  const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return base.data.mahmud;
};

module.exports = {
  config: {
    name: "cdp",
    version: "2.0",
    author: "Hasib (real: MahMUD)",
    countDown: 5,
    role: 0,
    category: "love",
    guide: "{pn} → Get random Couple DP\n{pn} list → Show total number of Couple DPs\n{pn} author → Show command author"
  },

  onStart: async function ({ message, args, event }) {
    try {
      // --- VIP CHECK ---
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

      const baseURL = await mahmud();

      // 📌 Author info
      if (args[0] === "author") {
        return message.reply("👑 Author: Hasib");
      }

      // 📌 List all couple DPs
      if (args[0] === "list") {
        const res = await axios.get(`${baseURL}/api/cdp/list`);
        const { total } = res.data;
        return message.reply(`🎀 𝐓𝐨𝐭𝐚𝐥 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏𝐬: ${total}`);
      }

      // 📌 Random Couple DP
      const res = await axios.get(`${baseURL}/api/cdp`);
      const { boy, girl } = res.data;
      if (!boy || !girl) return message.reply("⚠ No Couple DP found.");

      const getStream = async (url) => {
        try {
          const response = await axios({
            method: "GET",
            url,
            responseType: "stream",
            headers: { "User-Agent": "Mozilla/5.0" }
          });
          return response.data;
        } catch {
          return null;
        }
      };

      const attachments = [];
      const boyImg = await getStream(boy);
      const girlImg = await getStream(girl);

      if (boyImg) attachments.push(boyImg);
      if (girlImg) attachments.push(girlImg);

      if (!attachments.length) return message.reply("❌ Failed to fetch Couple DP.");

      message.reply({
        body: "🎀 | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐂𝐨𝐮𝐩𝐥𝐞 𝐃𝐏 (🏅 VIP)",
        attachment: attachments
      });

    } catch (error) {
      console.error("CDP command error:", error.message || error);
      message.reply("❌ | Something went wrong. Contact MahMUD.");
    }
  }
};
