module.exports.config = {
  name: "fuckv2",
  version: "3.3.0",
  permission: 0, // Manual owner check
  prefix: true,
  credits: "Nayan + Modified",
  description: "Owner-only hidden image command with permission system",
  category: "hidden",  // Hidden category for help command
  usages: "[@mention] | add/remove/list",
  cooldowns: 5,
  hidden: true,         // Custom flag for hidden commands
  dependencies: {
    "axios": "",
    "fs-extra": "",
    "path": "",
    "jimp": ""
  }
};

const fs = require("fs");
const path = require("path");

const OWNER_UID = "61557991443492"; // Only this UID can run
const permPath = path.join(__dirname, "cache", "fuckv2_permission.json");

// Ensure permission file exists
if (!fs.existsSync(permPath)) fs.writeFileSync(permPath, JSON.stringify([]));

function loadPermData() {
  try { return JSON.parse(fs.readFileSync(permPath)); } catch { return []; }
}
function savePermData(data) {
  fs.writeFileSync(permPath, JSON.stringify(data, null, 2));
}

module.exports.onLoad = async () => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const filePath = resolve(__dirname, "cache/canvas", "fuckv3.png");
  if (!existsSync(dirMaterial)) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(filePath)) await downloadFile("https://i.ibb.co/TW9Kbwr/images-2022-08-14-T183542-356.jpg", filePath);
};

async function makeImage({ one, two }) {
  const fsExtra = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"];
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let baseImg = await jimp.read(__root + "/fuckv3.png");
  let pathImg = __root + `/output_${one}_${two}.png`;
  let avatarOne = __root + `/avt_${one}.png`;
  let avatarTwo = __root + `/avt_${two}.png`;

  // Download avatars
  let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fsExtra.writeFileSync(avatarOne, Buffer.from(getAvatarOne, "utf-8"));

  let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" })).data;
  fsExtra.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, "utf-8"));

  // Circle avatars
  let circleOne = await jimp.read(await circle(avatarOne));
  let circleTwo = await jimp.read(await circle(avatarTwo));

  // Composite
  baseImg
    .composite(circleOne.resize(100, 100), 20, 300)
    .composite(circleTwo.resize(150, 150), 100, 20);

  let raw = await baseImg.getBufferAsync("image/png");
  fsExtra.writeFileSync(pathImg, raw);

  fsExtra.unlinkSync(avatarOne);
  fsExtra.unlinkSync(avatarTwo);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {
  const fsExtra = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  const mention = Object.keys(event.mentions);

  // 🔒 Only owner can run
  if (senderID !== OWNER_UID) {
    return; // silently ignore anyone else
  }

  let allowed = loadPermData();

  // 🔑 Owner permission management (still hidden)
  if (args[0] === "add" && mention[0]) {
    if (!allowed.includes(mention[0])) {
      allowed.push(mention[0]);
      savePermData(allowed);
      return api.sendMessage(`✅ Added permission for ${mention[0]}`, threadID, messageID);
    } else return api.sendMessage(`⚠️ User already has permission.`, threadID, messageID);
  }

  if (args[0] === "remove" && mention[0]) {
    allowed = allowed.filter(uid => uid !== mention[0]);
    savePermData(allowed);
    return api.sendMessage(`❌ Removed permission for ${mention[0]}`, threadID, messageID);
  }

  if (args[0] === "list") {
    if (allowed.length === 0) return api.sendMessage("📂 No users have permission yet.", threadID, messageID);
    return api.sendMessage("📂 Users with permission:\n" + allowed.join("\n"), threadID, messageID);
  }

  // Normal command execution for owner
  if (!mention[0]) return api.sendMessage("Please mention 1 person.", threadID, messageID);
  const one = senderID, two = mention[0];
  return makeImage({ one, two }).then(path =>
    api.sendMessage({ body: "", attachment: fsExtra.createReadStream(path) }, threadID,
      () => fsExtra.unlinkSync(path), messageID)
  );
};
