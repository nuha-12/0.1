module.exports = {
  config: {
    name: "block",
    author: "Hasib", 
    role: 3, // Owner-only
    shortDescription: "Block or unblock a user (Owner only)",
    longDescription: "",
    category: "admin",
    guide: "{pn} block/unblock [uid/fb link/mention]"
  },

  onStart: async function ({ api, event, args }) {
    const axios = require("axios");

    // Replace this with your actual owner ID(s)
    const OWNER_IDS = ["100060606189407", "61557991443492" ];

    if (!OWNER_IDS.includes(event.senderID)) {
      return api.sendMessage("❌ Only the owner can use this command.", event.threadID, event.messageID);
    }

    let id;

    // Check if a user is mentioned
    if (args.join().includes('@')) {
      id = Object.keys(event.mentions)[0];
    } else {
      id = args[1];
    }

    // Check if a Facebook link is provided
    if (args.join().includes(".com/")) {
      try {
        const res = await axios.get(`https://eurix-api.diciper09.repl.co/finduid?link=${encodeURIComponent(args[1])}`);
        id = res.data.result || args[1];
      } catch (err) {
        return api.sendMessage(`Error fetching UID: ${err}`, event.threadID, event.messageID);
      }
    }

    // Check for proper arguments
    if (!args[0] || !id) {
      return api.sendMessage(
        `『 Wrong format 』\nUsage:\n- ${this.config.name} block [uid/fb link/mention]\n- ${this.config.name} unblock [uid/fb link/mention]`,
        event.threadID,
        event.messageID
      );
    }

    // Block or unblock
    if (args[0].toLowerCase() === "block") {
      api.changeBlockedStatus(id, true, (err) => {
        if (err) return api.sendMessage(`${err}`, event.threadID, event.messageID);
        return api.sendMessage("✅ Successfully blocked user", event.threadID, event.messageID);
      });
    } else if (args[0].toLowerCase() === "unblock") {
      api.changeBlockedStatus(id, false, (err) => {
        if (err) return api.sendMessage(`${err}`, event.threadID, event.messageID);
        return api.sendMessage("✅ Successfully unblocked user", event.threadID, event.messageID);
      });
    } else {
      return api.sendMessage(
        `Invalid option. Use 'block' or 'unblock'.`,
        event.threadID,
        event.messageID
      );
    }
  },
};
