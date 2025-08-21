const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Load VIP data
const vipPath = __dirname + "/cache/vip.json";
if (!fs.existsSync(vipPath)) fs.writeFileSync(vipPath, JSON.stringify([]));
const getVIPs = () => JSON.parse(fs.readFileSync(vipPath));

const mahmud = async () => {
  const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return response.data.mahmud;
};

module.exports = {
  config: {
    name: "catvideo",
    aliases: ["catvid"],
    version: "1.8",
    role: 0,
    author: "Hasib",
    category: "media",
    guide: {
      en: "VIP only: Use {pn} to get a random cat video."
    }
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;
    const vipUsers = getVIPs();

    if (!vipUsers.includes(senderID)) {
      return message.reply("❌ You are not a VIP! Only VIP users can use this command.");
    }

    try {
      const loadingMessage = await message.reply("🐱 | Loading your VIP cat video... Please wait!");

      setTimeout(() => {
        api.unsendMessage(loadingMessage.messageID);
      }, 5000);

      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/album/videos/cat?userID=${senderID}`);
      if (!res.data.success || !res.data.videos.length)
        return api.sendMessage("❌ No videos found.", event.threadID, event.messageID);

      const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];
      const filePath = path.join(__dirname, "temp_video.mp4");

      const video = await axios({
        url,
        method: "GET",
        responseType: "stream",
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const writer = fs.createWriteStream(filePath);
      video.data.pipe(writer);

      const streamFinished = new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });
      await streamFinished;

      await api.sendMessage({
        body: "✨ | Here's your VIP Cat video!",
        attachment: fs.createReadStream(filePath)
      }, event.threadID, event.messageID);

      try { fs.unlinkSync(filePath); } catch(e) { console.error(e); }

    } catch (e) {
      console.error("ERROR:", e);
      api.sendMessage("❌ Failed to fetch or send video.", event.threadID, event.messageID);
    }
  }
};
