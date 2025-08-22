const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Path to VIP storage
const vipPath = path.join(__dirname, "cache", "vip.json");

// Load VIP list
function getVipList() {
  if (!fs.existsSync(vipPath)) return {};
  return JSON.parse(fs.readFileSync(vipPath, "utf8"));
}

// Check if VIP is still valid
function isVipUser(uid) {
  const vipData = getVipList();
  if (!vipData[uid]) return false;
  const now = Date.now();
  if (now > vipData[uid].expiry) {
    // Auto remove expired VIP
    delete vipData[uid];
    fs.writeFileSync(vipPath, JSON.stringify(vipData, null, 2));
    return false;
  }
  return true;
}

const mahmud = async () => {
  const response = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
  return response.data.mahmud;
};

module.exports = {
  config: {
    name: "catvideo",
    aliases: ["catvid"],
    version: "2.0",
    role: 0,
    author: "Hasib",
    category: "media",
    guide: {
      en: "Use {pn} to get a random cat video. (VIP only)"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      const uid = event.senderID;

      // ✅ VIP check
      if (!isVipUser(uid)) {
        return message.reply("⚠️ | This command is for 𝗩𝗜𝗣 users only.\n👉 Ask the owner to add you as VIP.");
      }

      const loadingMessage = await message.reply("🐱 | 𝗟𝗼𝗮𝗱𝗶𝗻𝗴 𝗿𝗮𝗻𝗱𝗼𝗺 𝗖𝗮𝘁 𝘃𝗶𝗱𝗲𝗼... 𝗣𝗹𝗲𝗮𝘀𝗲 𝘄𝗮𝗶𝘁..!!");

      setTimeout(() => api.unsendMessage(loadingMessage.messageID), 5000);

      const apiUrl = await mahmud();
      const res = await axios.get(`${apiUrl}/api/album/videos/cat?userID=${uid}`);
      if (!res.data.success || !res.data.videos.length) {
        return api.sendMessage("❌ | No videos found.", event.threadID, event.messageID);
      }

      const url = res.data.videos[Math.floor(Math.random() * res.data.videos.length)];
      const filePath = path.join(__dirname, `temp_${Date.now()}.mp4`);

      const video = await axios({
        url,
        method: "GET",
        responseType: "stream",
        headers: { "User-Agent": "Mozilla/5.0" }
      });

      const writer = fs.createWriteStream(filePath);
      video.data.pipe(writer);

      writer.on("finish", () => {
        const captions = [
          "✨ | 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐂𝐚𝐭 𝐯𝐢𝐝𝐞𝐨 🐱",
          "😸 | Enjoy this random Cat moment!",
          "🐾 | A cat video just for you!",
          "🎬 | Meow! Here’s a cat clip!"
        ];
        const caption = captions[Math.floor(Math.random() * captions.length)];

        api.sendMessage(
          { body: caption, attachment: fs.createReadStream(filePath) },
          event.threadID,
          () => fs.unlinkSync(filePath),
          event.messageID
        );
      });

      writer.on("error", () => {
        api.sendMessage("❌ | Download error.", event.threadID, event.messageID);
      });
    } catch (e) {
      console.error("ERROR:", e);
      api.sendMessage("❌ | Failed to fetch or send video.", event.threadID, event.messageID);
    }
  }
};
