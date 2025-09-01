module.exports.config = {
  name: "toilet",
  version: "1.0.3",
  permission: 0,
  credits: "Nayan",
  description: "Create a toilet meme with user's avatar",
  prefix: true,
  category: "user",
  usages: "@ or reply",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "canvas": "",
    "jimp": "",
    "node-superfetch": ""
  }
};

// Function to make an image circular
module.exports.circle = async (image) => {
  const jimp = global.nodemodule['jimp'];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api }) => {
  try {
    const Canvas = global.nodemodule['canvas'];
    const request = global.nodemodule['node-superfetch'];
    const fs = global.nodemodule['fs-extra'];

    const OWNER_ID = '61557991443492'; // Owner ID
    const cachePath = __dirname + '/cache/toilet.png';

    // Get target ID from mention or reply, default to sender
    let targetID = Object.keys(event.mentions || {})[0] || event.messageReply?.senderID || event.senderID;

    // Auto-reply if target is owner
    if (targetID === OWNER_ID) {
      return api.sendMessage("❌ You cannot use this command on the owner!", event.threadID, event.messageID);
    }

    // Ensure cache folder exists
    if (!fs.existsSync(__dirname + '/cache')) fs.mkdirSync(__dirname + '/cache');

    // Create canvas
    const canvas = Canvas.createCanvas(500, 670);
    const ctx = canvas.getContext('2d');
    const background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/779441456464003122/812706484240121876/unknown.png');

    // Fetch target avatar
    const avatarResp = await request.get(`https://graph.facebook.com/${targetID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    const avatar = await module.exports.circle(avatarResp.body);
    const avatarImage = await Canvas.loadImage(avatar);

    // Draw background
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    // Draw circular avatar (no border)
    ctx.drawImage(avatarImage, 135, 350, 205, 205);

    // Save and send image
    const imageBuffer = canvas.toBuffer();
    await fs.writeFile(cachePath, imageBuffer);
    api.sendMessage({
      body: "🐸🐸",
      attachment: fs.createReadStream(cachePath)
    }, event.threadID, () => fs.unlinkSync(cachePath), event.messageID);

  } catch (err) {
    api.sendMessage(`❌ Error:\n${err.message}`, event.threadID, event.messageID);
  }
};
