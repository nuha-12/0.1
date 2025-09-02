module.exports.config = {
  name: "anicouple",
  version: "1.0.6",
  permission: 0,
  prefix: true,
  credits: "Nayan",
  description: "Anime couple photo",
  category: "prefix",
  cooldowns: 2
};

const fs = require("fs");
const axios = require("axios");
const jimp = require("jimp");

// Owner UID
const OWNER_UID = "61557991443492";

// Mock VIP check function (replace with your VIP logic)
function isVip(uid) {
  // Owner bypass
  if (uid === OWNER_UID) return true;

  // Example VIP list (replace with your actual VIP loading)
  const vipList = ["1234567890", "9876543210"]; 
  return vipList.includes(uid);
}

// Helper to make a circle avatar
async function circle(imagePath) {
  let image = await jimp.read(imagePath);
  image.circle();
  return await image.getBufferAsync("image/png");
}

// Function to generate couple image
async function makeCoupleImage({ one, two }) {
  const dir = __dirname + "/cache/canvas";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const basePath = dir + "/anicouple_base.png";
  if (!fs.existsSync(basePath)) {
    // Download default couple image if not exists
    const url = "https://i.ibb.co/TW9Kbwr/images-2022-08-14-T183542-356.jpg";
    const res = await axios.get(url, { responseType: "arraybuffer" });
    fs.writeFileSync(basePath, Buffer.from(res.data, "utf-8"));
  }

  const avatarOnePath = dir + `/avt_${one}.png`;
  const avatarTwoPath = dir + `/avt_${two}.png`;
  const outPath = dir + `/couple_${one}_${two}.png`;

  // Download avatars
  const getAvatar = async (uid, path) => {
    const res = await axios.get(
      `https://graph.facebook.com/${uid}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    );
    fs.writeFileSync(path, Buffer.from(res.data, "utf-8"));
  };

  await getAvatar(one, avatarOnePath);
  await getAvatar(two, avatarTwoPath);

  // Compose image
  let base = await jimp.read(basePath);
  let circOne = await jimp.read(await circle(avatarOnePath));
  let circTwo = await jimp.read(await circle(avatarTwoPath));

  base
    .composite(circOne.resize(100, 100), 20, 300)
    .composite(circTwo.resize(150, 150), 100, 20);

  const buffer = await base.getBufferAsync("image/png");
  fs.writeFileSync(outPath, buffer);

  // Cleanup avatars
  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return outPath;
}

module.exports.run = async function ({ api, event }) {
  const { threadID, senderID, messageID, messageReply } = event;

  // VIP/Owner check
  if (!isVip(senderID)) {
    return api.sendMessage(
      "❌ You must be VIP to use this command.",
      threadID,
      messageID
    );
  }

  // Determine second user
  let secondUser;
  const mention = Object.keys(event.mentions);
  if (mention[0]) {
    secondUser = mention[0];
  } else if (messageReply && messageReply.senderID) {
    secondUser = messageReply.senderID;
  } else {
    return api.sendMessage(
      "⚠ Please mention someone or reply to their message.",
      threadID,
      messageID
    );
  }

  try {
    const imagePath = await makeCoupleImage({ one: senderID, two: secondUser });
    api.sendMessage(
      { body: "💖 Here's your anime couple photo!", attachment: fs.createReadStream(imagePath) },
      threadID,
      () => fs.unlinkSync(imagePath),
      messageID
    );
  } catch (err) {
    console.error(err);
    api.sendMessage("❌ Failed to generate image.", threadID, messageID);
  }
};
