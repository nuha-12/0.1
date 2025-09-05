const fs = require("fs");
const path = __dirname + "/cache/vip.json";

const OWNER_UID = "61557991443492" ; // Only Hasib can add VIPs
const DEFAULT_DAYS = 7;

module.exports = {
  config: {
    name: "vip",
    version: "5.1",
    author: "Hasib",
    role: 0, // Role check handled manually
    shortDescription: "VIP system with expiration, messaging, and admin removal",
    category: "admin",
    guide: `{pn} add [@tag/reply/uid] [days] | remove [@tag/reply/uid]\n{pn} list\n{pn} [message] (send to all VIPs)\n{pn} reply [@reply]`
  },

  langs: {
    en: {
      noOwner: "⚠️ Only Hasib can add VIPs.",
      noAdmin: "⚠️ Only admins can remove VIPs.",
      addSuccess: "✅ VIP added successfully for %1 day(s)!",
      alreadyInVIP: "⚠️ This user is already a VIP.",
      removeSuccess: "🗑 VIP removed successfully!",
      notInVIP: "❌ User is not in VIP list.",
      list: "📜 VIP list:\n%1",
      missingMessage: "❌ You need to write a message to send to VIPs!",
      reply: "📍 VIP %1: %2",
      replyUserSuccess: "✅ Message sent to VIP successfully!",
      expiredNotice: "⏰ VIP expired for user %1."
    }
  },

  onStart: async function ({ message, args, event, usersData, role, getLang }) {
    // Load VIP data
    if (!fs.existsSync(path)) fs.writeFileSync(path, JSON.stringify([]));
    let data = JSON.parse(fs.readFileSync(path));
    const now = Date.now();

    // --- Remove expired VIPs automatically ---
    const expired = data.filter(u => u.expire <= now);
    if (expired.length > 0) {
      for (const u of expired) {
        const name = await usersData.getName(u.uid);
        message.send(getLang("expiredNotice", name));
      }
      data = data.filter(u => u.expire > now);
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
    }

    // --- ADD VIP (Owner only) ---
    if (args[0] === "add") {
      if (event.senderID !== OWNER_UID) return message.reply(getLang("noOwner"));
      const uid = event.messageReply?.senderID || event.mentions?.[Object.keys(event.mentions || {})[0]] || args[1];
      if (!uid) return message.reply("Provide a UID, reply, or mention.");
      if (data.find(u => u.uid === uid)) return message.reply(getLang("alreadyInVIP"));

      let days = parseInt(args[2]) || DEFAULT_DAYS;
      if (isNaN(days) || days < 1) days = 1; // Minimum 1 day

      data.push({ uid, expire: now + days * 24 * 60 * 60 * 1000 });
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply(getLang("addSuccess", days));
    }

    // --- REMOVE VIP (Admins) ---
    if (args[0] === "remove") {
      if (role < 2) return message.reply(getLang("noAdmin"));
      const uid = event.messageReply?.senderID || event.mentions?.[Object.keys(event.mentions || {})[0]] || args[1];
      if (!uid) return message.reply("Provide a UID, reply, or mention.");

      const index = data.findIndex(u => u.uid === uid);
      if (index === -1) return message.reply(getLang("notInVIP"));

      data.splice(index, 1);
      fs.writeFileSync(path, JSON.stringify(data, null, 2));
      return message.reply(getLang("removeSuccess"));
    }

    // --- VIP LIST ---
    if (args[0] === "list") {
      if (data.length === 0) return message.reply("📜 VIP list is empty.");
      const listText = await Promise.all(data.map(async (u, i) => {
        const name = await usersData.getName(u.uid);
        const daysLeft = Math.max(0, Math.ceil((u.expire - now) / (1000 * 60 * 60 * 24)));
        return `${i + 1}. ${name} - ${daysLeft} day(s) left`;
      }));
      return message.reply(getLang("list", listText.join("\n")));
    }

    // --- REPLY TO VIP MESSAGE ---
    if (args[0] === "reply") {
      if (!event.messageReply) return message.reply("Reply to a VIP message to respond!");
      const uid = event.messageReply.senderID;
      await message.send({
        body: getLang("reply", await usersData.getName(uid), args.slice(1).join(" ")),
        mentions: [{ id: uid }]
      });
      return message.reply(getLang("replyUserSuccess"));
    }

    // --- BROADCAST MESSAGE TO ALL VIPs ---
    if (!args[0]) return message.reply(getLang("missingMessage"));
    const msg = args.join(" ");
    let success = 0, failed = 0;
    for (const { uid } of data) {
      try {
        await message.send({
          body: `📣 VIP message from ${await usersData.getName(event.senderID)}:\n\n${msg}`
        }, uid);
        success++;
      } catch (e) {
        failed++;
      }
    }
    return message.reply(`✅ Sent to ${success} VIP(s), failed: ${failed}`);
  }
};
