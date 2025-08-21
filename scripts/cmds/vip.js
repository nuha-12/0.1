const fs = require("fs");
const path = __dirname + "/cache/vip.json";

// Only Hasib is the real owner
const OWNER_ID = "61557991443492"; 

// Initialize file if not exists
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ vips: {} }, null, 2));

function loadData() {
  return JSON.parse(fs.readFileSync(path));
}

function saveData(data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function getRemainingDays(expireTime) {
  const now = Date.now();
  if (!expireTime) return "Unlimited";
  const diff = expireTime - now;
  if (diff <= 0) return "Expired";
  return Math.ceil(diff / (1000 * 60 * 60 * 24)) + " days";
}

// Auto-clean expired VIPs
function cleanupExpired(vipData) {
  const now = Date.now();
  for (let uid in vipData) {
    if (vipData[uid] && vipData[uid] < now) {
      delete vipData[uid];
    }
  }
  return vipData;
}

module.exports = {
  config: {
    name: "vip",
    aliases: ["v", "premium"],
    version: "6.0",
    author: "Hasib",
    role: 0,
    shortDescription: "VIP system managed by Hasib",
    category: "user",
    guide: "{pn} + <mention/uid/link> [days] | remove <mention/uid/link> | list"
  },

  onStart: async function ({ message, args, event, usersData }) {
    let data = loadData();
    let vipData = data.vips || {};
    const senderID = event.senderID;

    // --- Only Hasib can manage VIPs ---
    const isOwner = senderID === OWNER_ID;

    // --- Cleanup expired VIPs ---
    vipData = cleanupExpired(vipData);
    data.vips = vipData;
    saveData(data);

    // Helper: get UID from reply, mention, or direct args
    const getUID = () => event.messageReply?.senderID || Object.keys(event.mentions || {})[0] || args[3];

    // --- ADD VIP ---
    if ((args[0] === "+" && args[1] === "vip") || (args[0] === "vip" && args[1] === "add")) {
      if (!isOwner) return message.reply("⚠️ Only Hasib can add VIPs.");

      const uid = getUID();
      if (!uid) return message.reply("⚠️ Provide a UID, reply, or mention.");

      // Determine duration
      let days = 7; // default for "!add vip -" format
      if (args[0] === "vip" && args[1] === "add" && args[2] === "-" && args[3] && !isNaN(args[3])) {
        days = parseInt(args[3]);
      }

      const expire = days > 0 ? Date.now() + days * 86400000 : null;
      vipData[uid] = expire;
      data.vips = vipData;
      saveData(data);

      return message.reply(`✅ Added ${await usersData.getName(uid)} as VIP for ${days} day(s).`);
    }

    // --- REMOVE VIP ---
    if (args[0] === "remove") {
      if (!isOwner) return message.reply("⚠️ Only Hasib can remove VIPs.");

      const uid = getUID();
      if (!uid) return message.reply("⚠️ Provide a UID, reply, or mention.");
      if (!vipData[uid]) return message.reply("❌ User is not in VIP list.");

      delete vipData[uid];
      data.vips = vipData;
      saveData(data);

      return message.reply(`🗑 Removed ${await usersData.getName(uid)} from VIP list.`);
    }

    // --- VIP LIST ---
    if (args[0] === "list") {
      if (Object.keys(vipData).length === 0) return message.reply("📜 No VIPs found.");
      let list = await Promise.all(Object.keys(vipData).map(async (id, i) => {
        return `${i + 1}. ${await usersData.getName(id)} - ${getRemainingDays(vipData[id])}`;
      }));
      return message.reply("📜 VIP List:\n" + list.join("\n"));
    }

    // --- HELP MENU ---
    return message.reply(
`╭──✦ [ Command: VIP ]
├‣ 📜 Name: vip
├‣ 🪶 Aliases: v, premium
├‣ 👤 Credits: Hasib
╰‣ 🔑 Permission: Everyone

╭─✦ [ INFORMATION ]
├‣ Cost: Free
├‣ Description:
│   Manage VIP users: add, remove, and list.
╰─✦ Guide: !vip + <mention/uid/link> [days] | !vip remove <mention/uid/link> | !vip list

╭─✦ [ SETTINGS ]
├‣ 🚩 Prefix Required: ✓ Required
╰‣ ⚜ Premium: ✗ Free to Use`
    );
  }
};
