const OWNER_ID = '61557991443492'; // Your owner ID

module.exports.config = {
  name: "secretpic",       // Command name
  version: "1.0.0",
  permission: 2,           // Admin by default; we override manually
  credits: "YourName",
  description: "Hidden owner-only random image command",
  prefix: true,
  category: "hidden",      // Hidden category
  usages: "",
  cooldowns: 5,
  guide: "",               // Empty so it won't appear in help
};

module.exports.run = async ({ api, event, args }) => {
  // Only the owner can run this
  if (event.senderID !== OWNER_ID) return; // Completely silent for others

  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];

  // Safe example images
  const images = [
    "https://placekitten.com/300/300",
    "https://placekitten.com/400/400",
    "https://cataas.com/cat",
    "https://placekitten.com/500/500"
  ];

  const randomImage = images[Math.floor(Math.random() * images.length)];

  try {
    // Download image
    const response = await axios.get(randomImage, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'utf-8');

    // Send image to thread
    await api.sendMessage({ 
      body: "✅ Owner-only secret image command executed!",
      attachment: imageBuffer 
    }, event.threadID);
  } catch (err) {
    console.error(err);
    await api.sendMessage("❌ Failed to send image.", event.threadID);
  }
};
