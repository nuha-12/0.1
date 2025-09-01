module.exports.config = {
  name: "hot",
  version: "1.0.3",
  permission: 0,           // Manual owner check
  credits: "Nayan",
  description: "Random hot video (OWNER ONLY, hidden)",
  prefix: true,
  category: "hidden",      // Hidden from help
  usages: "",
  cooldowns: 5,
  hidden: true,            // Custom hidden flag
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

const OWNER_UID = "61557991443492"; // Only owner can run

module.exports.run = async function({ api, event }) {
  const { senderID, threadID, messageID } = event;

  // 🔒 Owner-only restriction
  if (senderID !== OWNER_UID) {
    return; // silently ignore anyone else
  }

  const cachePath = path.join(__dirname, "/cache/15.mp4");

  // List of Google Drive video URLs
  const videos = [
    'https://drive.google.com/uc?id=1ta1ujBjmcvxSuYVwQ3oEXIJsnPCW2VZO',
    'https://drive.google.com/uc?id=1b_evUu8zmfiPs-CeaZp1DkkArB5zl5x-',
    'https://drive.google.com/uc?id=1_ysGMbGZQexheta6tuSBhJQDeAMioXr',
    'https://drive.google.com/uc?id=1tlon-avneE7lQF2rS13GOeiuLWIUEA7J'
  ];

  // Pick a random video
  const videoURL = videos[Math.floor(Math.random() * videos.length)];

  try {
    // Download video
    const response = await axios.get(videoURL, { responseType: "arraybuffer" });
    await fs.writeFile(cachePath, Buffer.from(response.data, "utf-8"));

    // Send video
    api.sendMessage({ body: "--HOT💦--", attachment: fs.createReadStream(cachePath) }, threadID, () => {
      fs.unlinkSync(cachePath); // Delete after sending
    }, messageID);

  } catch (error) {
    console.error(error);
    api.sendMessage("❌ Failed to fetch video!", threadID, messageID);
  }
};
