const fs = require("fs");
const path = require("path");

// ====== VIP CONFIG ======
const vipPath = path.join(__dirname, "cache", "vip.json");
const OWNER_UID = "61557991443492"; // Owner UID

if (!fs.existsSync(vipPath)) fs.writeFileSync(vipPath, JSON.stringify([]));

function loadVipData() {
  try {
    return JSON.parse(fs.readFileSync(vipPath));
  } catch {
    return [];
  }
}

function saveVipData(data) {
  fs.writeFileSync(vipPath, JSON.stringify(data, null, 2));
}

function isVip(uid) {
  if (uid === OWNER_UID) return true; // Owner bypass
  const now = Date.now();
  const vipData = loadVipData();
  return vipData.some(u => u.uid === uid && u.expire > now);
}

// ====== SURAH DATA ======
const surahs = require("./surah.json"); // JSON with 114 surahs

// ====== MODULE CONFIG ======
module.exports.config = {
  name: "surah",
  version: "1.0.0",
  permission: 0,
  prefix: true,
  credits: "Nayan",
  description: "Fetch Qur'an surah by number",
  category: "user",
  usages: "<1-114>",
  cooldowns: 5
};

// ====== COMMAND ======
module.exports.run = async ({ event, api, args }) => {
  const { threadID, messageID, senderID } = event;

  // Check VIP
  if (!isVip(senderID)) {
    return api.sendMessage("❌ You must be VIP to use this command.", threadID, messageID);
  }

  const num = parseInt(args[0]);
  if (!num || num < 1 || num > 114) {
    return api.sendMessage("⚠ Please provide a number between 1 and 114.", threadID, messageID);
  }

  const surah = surahs[num - 1];
  return api.sendMessage(`📖 Surah ${num}: ${surah.name}\n\n${surah.text}`, threadID, messageID);
};

// ====== OPTIONAL: VIP MANAGEMENT ======
module.exports.vip = {
  add: (uid, days) => {
    const data = loadVipData();
    const expire = Date.now() + days * 24 * 60 * 60 * 1000;
    const existing = data.find(u => u.uid === uid);
    if (existing) existing.expire = expire;
    else data.push({ uid, expire });
    saveVipData(data);
  },
  remove: (uid) => {
    let data = loadVipData();
    data = data.filter(u => u.uid !== uid);
    saveVipData(data);
  },
  list: () => {
    const data = loadVipData();
    const now = Date.now();
    return data.map(u => {
      const left = Math.max(0, Math.floor((u.expire - now) / (24*60*60*1000)));
      return `• ${u.uid} — ${left} day(s) left`;
    });
  }
};
