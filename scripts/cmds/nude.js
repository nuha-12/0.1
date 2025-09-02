module.exports = {
  config: {
    name: "nude",
    aliases: ["nangai"],
    version: "1.1",
    credits: "OtinXSandip + Modified",
    description: "Sends random NSFW image (OWNER ONLY, hidden, permission-based)",
    prefix: true,
    category: "hidden",
    usages: "[@mention] | add/remove/list",
    cooldowns: 5,
    hidden: true,
    dependencies: {
      "fs-extra": "",
      "path": ""
    }
  }
};

const fs = require("fs-extra");
const path = require("path");

const OWNER_UID = "61557991443492"; // Owner UID
const permPath = path.join(__dirname, "cache/nude_permission.json");

// Ensure permission file exists
if (!fs.existsSync(permPath)) fs.writeFileSync(permPath, JSON.stringify([]));

function loadPermData() {
  try { return JSON.parse(fs.readFileSync(permPath)); } 
  catch { return []; }
}

function savePermData(data) {
  fs.writeFileSync(permPath, JSON.stringify(data, null, 2));
}

// Image list
const link = [
  "https://i.imgur.com/T5BPkRG.jpg",
  "https://i.imgur.com/69MT3Wg.jpg",
  "https://i.imgur.com/z6EtvVm.jpg",
  "https://i.imgur.com/hf3KluZ.jpg",
  "https://i.imgur.com/9XxaYI3.jpg",
  "https://i.imgur.com/rCSoCaA.jpg",
  "https://i.imgur.com/6olWIAr.jpg",
  "https://i.imgur.com/AcKfCpt.jpg",
  "https://i.imgur.com/OA6wMjp.jpg"
  // Add the rest of your URLs here
];

module.exports.onLoad = async function () {
  if (!fs.existsSync(path.join(__dirname, "cache"))) fs.mkdirSync(path.join(__dirname, "cache"), { recursive: true });
};

module.exports.onStart = async function ({ message, args, senderID }) {
  let allowed = loadPermData();

  // Owner permission management
  if (senderID === OWNER_UID) {
    if (args[0] === "add" && args[1]) {
      if (!allowed.includes(args[1])) {
        allowed.push(args[1]);
        savePermData(allowed);
        return message.send(`✅ Added permission for user ${args[1]}`);
      } else return message.send(`⚠️ User already has permission.`);
    }

    if (args[0] === "remove" && args[1]) {
      allowed = allowed.filter(uid => uid !== args[1]);
      savePermData(allowed);
      return message.send(`❌ Removed permission for user ${args[1]}`);
    }

    if (args[0] === "list") {
      if (allowed.length === 0) return message.send("📂 No users have permission yet.");
      return message.send("📂 Users with permission:\n" + allowed.join("\n"));
    }
  }

  // 🔒 Permission check
  if (senderID !== OWNER_UID && !allowed.includes(senderID)) {
    return message.send("🚫 You don’t have permission to use this command.");
  }

  // Send a random image
  const img = link[Math.floor(Math.random() * link.length)];
  message.send({
    body: "「 Sugar Mumma Ahh💦🥵 」",
    attachment: await global.utils.getStreamFromURL(img)
  });
};
