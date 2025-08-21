module.exports = {
  config: {
    name: "fakechat",
    version: "1.0",
    author: "Hasib",
    role: 2, // VIP only
    shortDescription: { en: "Send fake chat messages (VIP only)" },
    longDescription: { en: "Allows VIPs to send a fake styled message as if another person wrote it." },
    category: "fun",
    guide: { en: "fakechat <name>: <message>" }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, senderID } = event;

    // VIP system (edit as needed)
    const VIP_USERS = ["61557991443492", "100080875636629"]; 
    if (!VIP_USERS.includes(senderID)) {
      return api.sendMessage("❌ This command is for VIP users only.", threadID, messageID);
    }

    // Parse input
    const input = args.join(" ");
    if (!input.includes(":")) {
      return api.sendMessage("❌ Usage: fakechat <name>: <message>", threadID, messageID);
    }

    const [name, ...msgParts] = input.split(":");
    const message = msgParts.join(":").trim();

    if (!name || !message) {
      return api.sendMessage("❌ Usage: fakechat <name>: <message>", threadID, messageID);
    }

    // Format fake chat
    const fakeMessage = `👤 ${name.trim()}: ${message}`;
    return api.sendMessage(fakeMessage, threadID);
  }
};
