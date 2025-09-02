const axios = require("axios");
const fs = require("fs");
const path = require("path");

// Owner & VIP IDs
const OWNER_ID = "61557991443492"; // Replace with your owner ID
const VIPS = ["1234567890", "9876543210"]; // Add VIP user IDs

module.exports = {
  config: {
    name: "anivid",
    aliases: [],
    author: "Kshitiz",
    version: "1.1",
    cooldowns: 10,
    role: 0,
    shortDescription: "Get random anime video",
    longDescription: "Get random anime video from provided API",
    category: "fun",
    guide: "{p}anivid",
  },

  onStart: async function ({ api, event, args, message }) {
    // VIP & Owner check
    if (event.senderID !== OWNER_ID && !VIPS.includes(event.senderID)) {
      return api.sendMessage("❌ Only VIP users can use this command!", event.threadID, event.messageID);
    }

    api.setMessageReaction("🕐", event.messageID, (err) => {}, true);

    try {
      const response = await axios.get("https://ani-vid-0kr2.onrender.com/kshitiz");
      const postData = response.data.posts;
      const randomIndex = Math.floor(Math.random() * postData.length);
      const randomPost = postData[randomIndex];

      const videoUrls = randomPost.map(url => url.replace(/\\/g, "/"));
      const selectedUrl = videoUrls[Math.floor(Math.random() * videoUrls.length)];

      const videoResponse = await axios.get(selectedUrl, { responseType: "stream" });
      const tempVideoPath = path.join(__dirname, "cache", `${Date.now()}.mp4`);
      const writer = fs.createWriteStream(tempVideoPath);

      videoResponse.data.pipe(writer);

      writer.on("finish", async () => {
        const stream = fs.createReadStream(tempVideoPath);
        await message.reply({
          body: `🎬 Random Anime Video:`,
          attachment: stream,
        });
        api.setMessageReaction("✅", event.messageID, (err) => {}, true);
        fs.unlink(tempVideoPath, (err) => err && console.error(err));
      });
    } catch (error) {
      console.error(error);
      message.reply("❌ Sorry, an error occurred while processing your request.");
    }
  }
};
