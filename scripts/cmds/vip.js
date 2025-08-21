const fs = require("fs");
const path = __dirname + "/cache/vip.json";

const OWNER_ID = "61557991443492"; // 👑 Owner/Super Admin

// Initialize file if not exists
if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify({ vips: {}, tasks: {} }, null, 2));

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

module.exports = {
  config: {
    name: "vip",
    aliases: ["v", "premium"],
    version: "5.0",
    author: "Hasib",
    role: 0,
    shortDescription: "Manage VIP users with owner control & tasks",
    category: "user",
    guide: "{pn} + <mention/uid/link> [days] | remove <mention/uid/link> | list | task | task claim"
  },

  onStart: async function ({ message, args, event, usersData }) {
    let data = loadData();
    let vipData = data.vips || {};
    let tasks = data.tasks || {};
    const senderID = event.senderID;
    const isOwner = senderID === OWNER_ID;

    // Helper: get UID from reply, mention, or direct args
    const getUID = () => event.messageReply?.senderID || Object.keys(event.mentions || {})[0] || args[3];

    // --- ADD VIP ---
    if ((args[0] === "+" && args[1] === "vip") || (args[0] === "vip" && args[1] === "add")) {
      if (!isOwner) return message.reply("⚠️ Only the Owner can add VIPs.");

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
      if (!isOwner) return message.reply("⚠️ Only the Owner can remove VIPs.");

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

    // --- VIP TASKS ---
    if (args[0] === "task") {
      // Show task instructions
      if (!args[1]) {
        return message.reply(
`📌 VIP Task:
1. Send 200 messages in the group
2. React to the Owner's post
Use \`vip task claim\` when done to get VIP +2 days`
        );
      }

      // Claim task reward
      if (args[1] === "claim") {
        if (!vipData[senderID]) return message.reply("❌ You are not a VIP.");
        const expire = vipData[senderID];
        if (expire && expire < Date.now()) return message.reply("❌ Your VIP has expired.");

        const lastClaim = tasks[senderID] || 0;
        const now = Date.now();
        if (now - lastClaim < 86400000) return message.reply("⚠️ You already claimed your task reward today.");

        // Extend VIP by 2 days
        const currentExpire = vipData[senderID] || now;
        const newExpire = currentExpire > now ? currentExpire + 2 * 86400000 : now + 2 * 86400000;
        vipData[senderID] = newExpire;

        // Save task claim timestamp
        tasks[senderID] = now;

        // Save data
        data.vips = vipData;
        data.tasks = tasks;
        saveData(data);

        return message.reply(`🎉 Task completed! Your VIP has been extended by 2 days. New expiry: ${new Date(newExpire).toLocaleString()}`);
      }
    }

    // --- HELP MENU ---
    return message.reply(
`╭──✦ [ Command: VIP ]
├‣ 📜 Name: vip
├‣ 🪶 Aliases: v, premium
├‣ 👤 Credits: Dipto
╰‣ 🔑 Permission: Everyone

╭─✦ [ INFORMATION ]
├‣ Cost: Free
├‣ Description:
│   Manage VIP users: add, remove, and list.
╰─✦ Guide: !vip + <mention/uid/link> [days] | !vip remove <mention/uid/link> | !vip list | !vip task | !vip task claim

╭─✦ [ SETTINGS ]
├‣ 🚩 Prefix Required: ✓ Required
╰‣ ⚜ Premium: ✗ Free to Use`
    );
  }
};
