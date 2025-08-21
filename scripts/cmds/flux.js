const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "flux",
    aliases: ["aiimg", "genimg"],
    version: "1.0",
    author: "Hasib",
    role: 0, // everyone can use
    countDown: 5,
    shortDescription: { en: "Generate AI images using FluxPro" },
    longDescription: { en: "Massager bot command to create AI images from a prompt." },
    category: "image",
    guide: { en: "flux <prompt>" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const prompt = args.join(" ");

    if (!prompt) return api.sendMessage("❌ Please provide a prompt.\nUsage: flux <your prompt>", threadID, messageID);

    try {
      api.sendMessage("⏳ Generating your Flux AI image...", threadID, messageID);

      // Example API call (replace with actual FluxPro API if needed)
      const response = await axios.get(`https://nexusflux-api.vercel.app/flux?prompt=${encodeURIComponent(prompt)}`);
      if (!response.data || !response.data.url) return api.sendMessage("❌ Failed to generate image.", threadID, messageID);

      const imageUrl = response.data.url;
      const imgPath = path.join(__dirname, "cache", `${Date.now()}_flux.jpg`);
      const imgData = await axios.get(imageUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(imgPath, Buffer.from(imgData.data, "binary"));

      api.sendMessage(
        { body: `✅ Flux AI Image Generated\n🎨 Prompt: ${prompt}`, attachment: fs.createReadStream(imgPath) },
        threadID,
        () => fs.unlinkSync(imgPath),
        messageID
      );

    } catch (err) {
      api.sendMessage(`❌ Error: ${err.message}`, threadID, messageID);
    }
  }
};
