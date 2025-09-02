module.exports = {
  config: {
    name: "hvd2",
    aliases: ["hvdo"],
    version: "1.1",
    author: "kshitiz + modified",
    countDown: 60,
    role: 0, // manual owner permission check
    shortDescription: "Send hentai video (OWNER ONLY, hidden)",
    longDescription: "Sends a random hentai video",
    category: "hidden",
    guide: "{pn}hvdo",
    hidden: true,
    dependencies: {
      "fs-extra": "",
      "path": "",
      "axios": ""
    }
  },

  permPath: require("path").join(__dirname, "cache/hvd2_permission.json"),

  onLoad: function() {
    const fs = require("fs-extra");
    if (!fs.existsSync(this.permPath)) fs.writeFileSync(this.permPath, JSON.stringify([]));
    if (!fs.existsSync(require("path").join(__dirname, "cache"))) fs.mkdirSync(require("path").join(__dirname, "cache"), { recursive: true });
  },

  loadPermData() {
    const fs = require("fs-extra");
    try { return JSON.parse(fs.readFileSync(this.permPath)); } 
    catch { return []; }
  },

  savePermData(data) {
    const fs = require("fs-extra");
    fs.writeFileSync(this.permPath, JSON.stringify(data, null, 2));
  },

  onStart: async function({ message, event, args }) {
    const fs = require("fs-extra");
    const axios = require("axios");
    const path = require("path");
    const OWNER_UID = "61557991443492";

    let allowed = this.loadPermData();
    const senderID = event.senderID;

    // Owner permission management
    if (senderID === OWNER_UID) {
      if (args[0] === "add" && args[1]) {
        if (!allowed.includes(args[1])) {
          allowed.push(args[1]);
          this.savePermData(allowed);
          return message.send(`✅ Added permission for ${args[1]}`);
        } else return message.send(`⚠️ User already has permission.`);
      }

      if (args[0] === "remove" && args[1]) {
        allowed = allowed.filter(uid => uid !== args[1]);
        this.savePermData(allowed);
        return message.send(`❌ Removed permission for ${args[1]}`);
      }

      if (args[0] === "list") {
        if (allowed.length === 0) return message.send("📂 No users have permission yet.");
        return message.send("📂 Users with permission:\n" + allowed.join("\n"));
      }
    }

    // Permission check
    if (senderID !== OWNER_UID && !allowed.includes(senderID)) {
      return message.send("🚫 You don’t have permission to use this command.");
    }

    const loadingMessage = await message.reply({ body: "Loading random hentai... Please wait! up to 5min 🤡" });

    const videos = [
      "https://drive.google.com/uc?export=download&id=1ywjcqK_AkWyxnRXjoB0JKLdChZsR69cK",
      "https://drive.google.com/uc?export=download&id=1xyC3bJWlmZVMoWJHYRLdX_dNibPVBDIV",
      "https://drive.google.com/uc?export=download&id=1whpsUv4Xzt3bp-QSlx03cLdwW2UsnEt2"
      // Add rest of your video links here
    ];

    const videoURL = videos[Math.floor(Math.random() * videos.length)];
    const cachePath = path.join(__dirname, "/cache/hvd2.mp4");

    try {
      const response = await axios.get(videoURL, { responseType: "arraybuffer" });
      await fs.writeFile(cachePath, Buffer.from(response.data));

      await message.send({
        body: "--Hentai Video💦--",
        attachment: fs.createReadStream(cachePath)
      });

      fs.unlinkSync(cachePath);
    } catch (err) {
      console.error(err);
      message.send("❌ Failed to fetch video!");
    }
  }
};
