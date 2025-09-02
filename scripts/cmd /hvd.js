module.exports.config = {
  name: "hvd",
  aliases: ["hvdo"],
  version: "1.1",
  author: "kshitiz",
  countDown: 60,
  role: 0, // Permission handled manually
  shortDescription: "Get hentai video",
  longDescription: "Sends hentai videos (OWNER ONLY, hidden)",
  category: "hidden", // Hidden from help
  guide: "{p}{n}hvdo",
  hidden: true
};

const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const OWNER_UID = "61557991443492"; // Your UID
const permPath = path.join(__dirname, "cache/hvd_permission.json");

// Ensure permission file exists
if (!fs.existsSync(permPath)) fs.writeFileSync(permPath, JSON.stringify([]));

function loadPermData() {
  try { return JSON.parse(fs.readFileSync(permPath)); } 
  catch { return []; }
}

function savePermData(data) {
  fs.writeFileSync(permPath, JSON.stringify(data, null, 2));
}

module.exports.onStart = async function({ api, event, message }) {
  const senderID = event.senderID;
  const args = event.body.split(" ");

  let allowed = loadPermData();

  // Owner permission commands
  if (senderID === OWNER_UID) {
    const mention = Object.keys(event.mentions);
    if (args[0] === "add" && mention[0]) {
      if (!allowed.includes(mention[0])) {
        allowed.push(mention[0]);
        savePermData(allowed);
        return api.sendMessage(`✅ Added permission for ${mention[0]}`, event.threadID);
      } else return api.sendMessage("⚠️ User already has permission.", event.threadID);
    }

    if (args[0] === "remove" && mention[0]) {
      allowed = allowed.filter(uid => uid !== mention[0]);
      savePermData(allowed);
      return api.sendMessage(`❌ Removed permission for ${mention[0]}`, event.threadID);
    }

    if (args[0] === "list") {
      if (allowed.length === 0) return api.sendMessage("📂 No users have permission yet.", event.threadID);
      return api.sendMessage("📂 Users with permission:\n" + allowed.join("\n"), event.threadID);
    }
  }

  // Permission check
  if (senderID !== OWNER_UID && !allowed.includes(senderID)) {
    return api.sendMessage("🚫 You don’t have permission to use this command.", event.threadID);
  }

  // Send video
  const loadingMessage = await message.reply({ body: "Loading hentai video... Please wait! 🥵" });

  const videos = [
    "https://drive.google.com/uc?export=download&id=1ywjcqK_AkWyxnRXjoB0JKLdChZsR69cK",
    "https://drive.google.com/uc?export=download&id=1xyC3bJWlmZVMoWJHYRLdX_dNibPVBDIV",
    "https://drive.google.com/uc?export=download&id=1whpsUv4Xzt3bp-QSlx03cLdwW2UsnEt2"
    // Add more URLs
  ];

  const videoURL = videos[Math.floor(Math.random() * videos.length)];
  const cachePath = path.join(__dirname, "/cache/hvd.mp4");

  try {
    const response = await axios.get(videoURL, { responseType: "arraybuffer" });
    await fs.writeFile(cachePath, Buffer.from(response.data, "utf-8"));

    api.sendMessage({ body: "--Hentai💦--", attachment: fs.createReadStream(cachePath) }, event.threadID, () => {
      fs.unlinkSync(cachePath);
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Failed to fetch video!", event.threadID);
  }
};
